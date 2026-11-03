"use client";

import { useEffect, useRef, useState } from "react";
import { Alert } from "@/components/controls/alert";
import { buttonClass } from "@/components/controls/button";
import { DownloadButton } from "@/components/download-button/download-button";
import { ImageDropzone } from "@/components/image-uploader/image-dropzone";
import { track } from "@/lib/analytics";
import { createProcessingPool, isAbortError, type ProcessingPool } from "@/lib/image-processing/client";
import { toImageToolError } from "@/lib/image-processing/errors";
import { ALL_INPUT_FORMATS, FORMATS } from "@/lib/image-processing/formats";
import type { ToolId } from "@/lib/tools/registry";
import { countBucket, formatBytes, formatDimensions, KB, outputFileName } from "@/lib/utils/format";
import { useObjectUrl, useRevealResult } from "./hooks";
import { useImageList, type ListImage } from "./image-list";
import { MAX_BATCH, reduceToTarget, targetVerdict, type TargetOutput, type TargetSettings } from "./target-size-shared";

interface BatchResult {
  key: string;
  output?: TargetOutput;
  settings?: TargetSettings;
  error?: string;
}

/**
 * Several photos reduced to the same target: each one gets its own result and download, plus one ZIP of all.
 * Processing runs in a small worker pool and starts by itself, again whenever the settings change.
 */
export function TargetSizeBatch({
  tool,
  files,
  settings,
  settingsKey,
  settingsPanel,
  onReset,
}: {
  tool: ToolId;
  files: File[];
  settings: TargetSettings | null;
  settingsKey: string;
  settingsPanel: React.ReactNode;
  onReset: () => void;
}) {
  const list = useImageList({ tool, accept: ALL_INPUT_FORMATS, max: MAX_BATCH });
  const [results, setResults] = useState<Record<string, BatchResult>>({});
  const [zipping, setZipping] = useState<number | null>(null);
  const [zipError, setZipError] = useState<string | null>(null);
  const pool = useRef<ProcessingPool | null>(null);
  const inFlight = useRef(new Set<string>());
  const tracked = useRef(new Set<string>());
  const latestKey = useRef(settingsKey);
  latestKey.current = settingsKey;

  // Added after mounting, not during it: React's development double-mount would otherwise cancel the first checks.
  const { add } = list;
  useEffect(() => {
    const timer = setTimeout(() => add(files), 0);
    return () => clearTimeout(timer);
  }, [add, files]);

  useEffect(
    () => () => {
      pool.current?.dispose();
      pool.current = null;
    },
    [],
  );

  const keyOf = (item: ListImage) => `${item.id}|${settingsKey}`;

  // Process every ready photo that has no result for the current settings yet.
  useEffect(() => {
    if (!settings) return;
    const run = (pool.current ??= createProcessingPool()).run;
    for (const item of list.ready) {
      const key = keyOf(item);
      if (results[item.id]?.key === key || inFlight.current.has(key) || !item.mime || !item.width || !item.height) continue;
      inFlight.current.add(key);
      // The decoded photo is cached per item, so changing a setting doesn't decode it again.
      const image = { id: item.id, file: item.file, mime: item.mime, width: item.width, height: item.height };
      // A result for settings that have since changed is dropped, so it can't overwrite a newer one.
      const stillCurrent = () => key === `${item.id}|${latestKey.current}`;
      reduceToTarget(run, image, settings)
        .then((output) => {
          if (output && stillCurrent()) setResults((all) => ({ ...all, [item.id]: { key, output, settings } }));
        })
        .catch((caught: unknown) => {
          if (isAbortError(caught) || !stillCurrent()) return;
          setResults((all) => ({ ...all, [item.id]: { key, error: toImageToolError(caught).message } }));
        })
        .finally(() => inFlight.current.delete(key));
    }
    // keyOf depends only on settingsKey.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list.ready, settings, settingsKey, results]);

  const rows = list.items.map((item) => {
    const result = results[item.id];
    return { item, result: result?.key === keyOf(item) ? result : undefined };
  });
  const done = rows.filter((row) => row.result?.output);
  const total = rows.filter((row) => row.item.status !== "invalid").length;
  const working = settings !== null && rows.some((row) => row.item.status !== "invalid" && !row.result);
  const finished = total > 0 && !working && !list.checking;
  const headingRef = useRevealResult(finished ? settingsKey : null);

  useEffect(() => {
    if (!finished || tracked.current.has(settingsKey)) return;
    tracked.current.add(settingsKey);
    track("bulk_resize_completed", { tool, count_bucket: countBucket(done.length) });
  }, [finished, settingsKey, tool, done.length]);

  const fileNameFor = (item: ListImage, output: TargetOutput) =>
    outputFileName(item.name, `${Math.ceil(output.image.blob.size / KB)}kb`, FORMATS[output.image.mime].extension);

  const downloadZip = async () => {
    if (done.length === 0) return;
    setZipError(null);
    setZipping(0);
    try {
      const { createZip, safeZipName, uniqueNames } = await import("@/lib/zip/zip");
      const names = uniqueNames(done.map((row) => safeZipName(fileNameFor(row.item, row.result!.output!))));
      const zip = await createZip(
        done.map((row, index) => ({ name: names[index]!, blob: row.result!.output!.image.blob })),
        (fraction) => setZipping(fraction),
      );
      const url = URL.createObjectURL(zip);
      const link = document.createElement("a");
      link.href = url;
      link.download = settings ? `photos-${Math.round(settings.targetBytes / KB)}kb.zip` : "photos.zip";
      document.body.appendChild(link);
      link.click();
      link.remove();
      // Give the browser time to start the download before freeing the memory.
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
      track("bulk_download_completed", { tool, count_bucket: countBucket(done.length), mode: "zip" });
    } catch (caught) {
      setZipError(caught instanceof Error && caught.name === "ZipError" ? caught.message : "The ZIP couldn't be created. Download the photos one by one instead.");
    } finally {
      setZipping(null);
    }
  };

  const remove = (id: string) => {
    list.remove(id);
    setResults(({ [id]: _removed, ...rest }) => rest);
  };

  return (
    <div className="space-y-6">
      <section aria-label="Settings for every photo" className="space-y-4 rounded-lg border border-line bg-canvas p-4 shadow-sm sm:p-5">
        <p className="text-sm text-ink-soft">
          These settings apply to every photo. Change them and all photos are made again.
        </p>
        <div className="space-y-5">{settingsPanel}</div>
      </section>

      <section aria-labelledby="batch-heading" className="rounded-lg border border-line bg-canvas shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
          <h2 id="batch-heading" ref={headingRef} tabIndex={-1} className="scroll-mt-24 text-lg font-bold text-ink outline-none" aria-live="polite">
            {done.length} of {total} {total === 1 ? "photo" : "photos"} ready{working ? " · working…" : ""}
          </h2>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={downloadZip} disabled={done.length === 0 || zipping !== null} className={buttonClass("primary", "px-5")}>
              {zipping !== null ? `Creating ZIP… ${Math.round(zipping * 100)}%` : `Download all (${done.length}) as ZIP`}
            </button>
            <button type="button" onClick={onReset} className={buttonClass("ghost", "px-3 text-sm")}>
              Start over
            </button>
          </div>
        </div>

        <ul className="divide-y divide-line">
          {rows.map(({ item, result }) => (
            <BatchRow key={item.id} tool={tool} item={item} result={result} fileName={result?.output ? fileNameFor(item, result.output) : ""} onRemove={() => remove(item.id)} />
          ))}
        </ul>

        <div className="space-y-3 border-t border-line p-4 sm:p-5">
          {list.notice ? <Alert tone="info">{list.notice}</Alert> : null}
          {zipError ? (
            <Alert tone="error" title="ZIP download failed">
              {zipError}
            </Alert>
          ) : null}
          {list.items.length < MAX_BATCH ? (
            <ImageDropzone accept={ALL_INPUT_FORMATS} onFiles={list.add} maxFiles={MAX_BATCH - list.items.length} prompt="Add more photos" compact acceptHandOff={false} />
          ) : null}
        </div>
      </section>
    </div>
  );
}

function BatchRow({ tool, item, result, fileName, onRemove }: { tool: ToolId; item: ListImage; result?: BatchResult; fileName: string; onRemove: () => void }) {
  const output = result?.output;
  const url = useObjectUrl(output?.image.blob ?? null);
  const verdict = output && result?.settings ? targetVerdict(output, result.settings) : null;

  let status: React.ReactNode;
  if (item.status === "invalid") status = <span className="text-danger-ink">{item.error ?? "This file can't be used."}</span>;
  else if (item.status === "checking") status = <span className="text-muted">Checking…</span>;
  else if (result?.error) status = <span className="text-danger-ink">{result.error}</span>;
  else if (!output) status = <span className="text-muted">Working…</span>;
  else
    status = (
      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="tabular-nums text-muted">{formatBytes(item.size)} →</span>
        <span className="font-semibold tabular-nums text-ink">{formatBytes(output.image.blob.size)}</span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
            verdict === "closest" ? "bg-warning-soft text-warning" : "bg-success-soft text-success-ink"
          }`}
        >
          {verdict === "closest" ? "closest possible" : verdict === "unchanged" ? "already under" : "within target"}
        </span>
        <span className="w-full text-xs text-muted">{formatDimensions(output.image.width, output.image.height)}</span>
      </span>
    );

  return (
    <li className="flex items-center gap-3 px-4 py-3 sm:px-5">
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md border border-line bg-surface">
        {item.thumbUrl ? <img src={item.thumbUrl} alt="" className="h-full w-full object-cover" /> : null}
      </div>
      <div className="min-w-0 flex-1 text-sm">
        <p className="truncate font-medium text-ink" title={item.name}>
          {item.name}
        </p>
        <div className="mt-0.5">{status}</div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5 sm:flex-row sm:items-center">
        {url && output ? (
          <DownloadButton href={url} fileName={fileName} label="Download" tool={tool} outputFormat={FORMATS[output.image.mime].label} />
        ) : null}
        <button type="button" onClick={onRemove} className="text-xs font-medium text-muted underline hover:text-ink" aria-label={`Remove ${item.name}`}>
          Remove
        </button>
      </div>
    </li>
  );
}
