import type { ApplicationRequirements, ImageSpec, RequirementSet } from "./types";

/**
 * Exam and recruitment photo requirements, verified against the official
 * documents listed in each `source`. Read the rules in ./types.ts before
 * editing. When a new notification is published, add or replace the set,
 * update `lastVerified`, and update the tool's `updated` date in the registry.
 */

// ---------------------------------------------------------------- IBPS / SBI shared wording
// IBPS's three 2026 Common Recruitment Process notifications and SBI's 2026
// advertisements state the same photo and signature specification. They are
// still stored per notification, because any one of them may change.

const BANKING_PHOTO_RULES = [
  "Recent passport-style colour photograph",
  "Taken against a light-coloured, preferably white, background",
  "Look straight at the camera with a relaxed face",
  "No harsh shadows; no red-eye if flash is used",
  "If you wear glasses, no reflections and eyes clearly visible",
  "Caps, hats and dark glasses are not acceptable; religious headwear is allowed but must not cover the face",
];

const BANKING_SIGNATURE_RULES = [
  "Sign on white paper with a black ink pen",
  "Must be signed by the applicant only",
  "Signature in CAPITAL LETTERS is not accepted",
];

function bankingPhoto(): ImageSpec {
  return {
    kind: "photo",
    format: "JPG/JPEG",
    widthPx: 200,
    heightPx: 230,
    pixelBasis: "preferred",
    physical: "4.5 cm × 3.5 cm",
    aspect: 200 / 230,
    minKB: 20,
    maxKB: 50,
    rules: BANKING_PHOTO_RULES,
  };
}

function bankingSignature(): ImageSpec {
  return {
    kind: "signature",
    format: "JPG/JPEG",
    widthPx: 140,
    heightPx: 60,
    pixelBasis: "preferred",
    aspect: 140 / 60,
    minKB: 10,
    maxKB: 20,
    rules: BANKING_SIGNATURE_RULES,
  };
}

/** Left thumb impression: identical wording in IBPS CRP PO/CSA/SPL-XVI (Annexure III) and SBI PO 2026 (Annexure II). */
function bankingThumb(rules: string[]): ImageSpec {
  return {
    kind: "thumb",
    format: "JPG/JPEG",
    widthPx: 240,
    heightPx: 240,
    pixelBasis: "preferred",
    physical: "3 cm × 3 cm",
    dpi: 200,
    aspect: 1,
    minKB: 20,
    maxKB: 50,
    rules: ["Put your left thumb impression on white paper with black or blue ink", ...rules],
  };
}

/** Hand-written declaration: same size and file limits in IBPS and SBI; the wording to copy differs. */
function bankingDeclaration(rules: string[]): ImageSpec {
  return {
    kind: "declaration",
    format: "JPG/JPEG",
    widthPx: 800,
    heightPx: 400,
    pixelBasis: "preferred",
    physical: "10 cm × 5 cm",
    dpi: 200,
    aspect: 2,
    minKB: 50,
    maxKB: 100,
    rules: ["Write the declaration in English, clearly, on white paper with black ink", "Must be in your own handwriting and NOT in capital letters", ...rules],
  };
}

const IBPS_THUMB = bankingThumb([
  "No left thumb: use the right thumb; if both are missing, a finger of the left hand starting from the forefinger (the notification lists the full order), and state in the uploaded image which finger or toe was used",
]);
const IBPS_DECLARATION = bankingDeclaration([
  "Text: “I, ______ (Name of the candidate), hereby declare that all the information submitted by me in the application form is correct, true and valid. I will present the supporting documents as and when required.”",
  "If you can't write, the text may be typed, with your left thumb impression below it (if you also can't sign)",
]);
const SBI_THUMB = bankingThumb(["No left thumb: you may use your right thumb"]);
const SBI_DECLARATION = bankingDeclaration([
  "Text: “I ______ (Name of the candidate), ______ (Date of Birth) hereby declare that all the information submitted by me in the application form is correct, true and valid. I will present the supporting documents as and when required. The signature, photograph and left-hand thumb impression is of mine”",
]);

const IBPS_NOTES = [
  "In addition to the uploaded photograph, the application asks you to capture a live photograph with a webcam or phone.",
  "The system won't let you continue until the photograph and signature match the specification.",
];

const BANKING_LIVE_NOTE =
  "In addition to the uploaded photograph, the application asks you to capture a live photograph with a webcam or phone.";

// ---------------------------------------------------------------- IBPS

const IBPS_SETS: RequirementSet[] = [
  {
    id: "ibps-crp-po-mt-xvi",
    name: "CRP PO/MT-XVI (Probationary Officers / Management Trainees, vacancies 2027-28)",
    photo: bankingPhoto(),
    signature: bankingSignature(),
    thumb: IBPS_THUMB,
    declaration: IBPS_DECLARATION,
    notes: IBPS_NOTES,
    source: {
      title: "Notification CRP PO/MT-XVI",
      url: "https://www.ibps.in/wp-content/uploads/Detailed-Notification_CRP-PO-XVI_Final_V1_30.06.2026.pdf",
      publisher: "Institute of Banking Personnel Selection (IBPS)",
      section: "Annexure III: Guidelines for Scanning and Upload of Documents",
      lastVerified: "2026-10-18",
    },
  },
  {
    id: "ibps-crp-csa-xvi",
    name: "CRP CSA-XVI (Customer Service Associates / Clerks, vacancies 2027-28)",
    photo: bankingPhoto(),
    signature: bankingSignature(),
    thumb: IBPS_THUMB,
    declaration: IBPS_DECLARATION,
    notes: IBPS_NOTES,
    source: {
      title: "Notification CRP CSA-XVI",
      url: "https://www.ibps.in/wp-content/uploads/Notification_CRP_CSA_XVI-Final.pdf",
      publisher: "Institute of Banking Personnel Selection (IBPS)",
      section: "Annexure III: Guidelines for Scanning and Upload of Documents",
      lastVerified: "2026-10-18",
    },
  },
  {
    id: "ibps-crp-spl-xvi",
    name: "CRP SPL-XVI (Specialist Officers, vacancies 2027-28)",
    photo: bankingPhoto(),
    signature: bankingSignature(),
    thumb: IBPS_THUMB,
    declaration: IBPS_DECLARATION,
    notes: IBPS_NOTES,
    source: {
      title: "Notification CRP SPL-XVI",
      url: "https://www.ibps.in/wp-content/uploads/Detailed-Notification-CRP-SPL-XVI_Final_V1_30.06.2026.pdf",
      publisher: "Institute of Banking Personnel Selection (IBPS)",
      section: "Annexure III: Guidelines for Scanning and Upload of Documents",
      lastVerified: "2026-10-18",
    },
  },
];

// ---------------------------------------------------------------- SBI

const SBI_SETS: RequirementSet[] = [
  {
    id: "sbi-po-2026-27-09",
    name: "Probationary Officers 2026 (Advertisement CRPD/PO/2026-27/09)",
    photo: bankingPhoto(),
    signature: bankingSignature(),
    thumb: SBI_THUMB,
    declaration: SBI_DECLARATION,
    notes: [BANKING_LIVE_NOTE],
    source: {
      title: "Recruitment of Probationary Officers – Advertisement No. CRPD/PO/2026-27/09",
      url: "https://sbi.bank.in/csfile/18062026_1_Detailed_Adv.2026.pdf",
      publisher: "State Bank of India, Central Recruitment & Promotion Department",
      section: "Annexure II: Guidelines for scanning and upload of photograph, signature, left-hand thumb impression and hand-written declaration",
      lastVerified: "2026-10-18",
    },
  },
  {
    id: "sbi-rs-2026-27-06",
    name: "Retired Bank Officers as Resolvers (Advertisement CRPD/RS/2026-27/06)",
    photo: { ...bankingPhoto(), physical: undefined },
    signature: bankingSignature(),
    source: {
      title: "Engagement of Retired Bank Officers as Resolvers – Advertisement No. CRPD/RS/2026-27/06",
      url: "https://sbi.bank.in/documents/77530/57941334/15042026_ADVERTISEMENT_ADV_CRPD_RS_2026_27_06.pdf/8cae2a8a-b88d-c8e4-6b34-33c49038304a",
      publisher: "State Bank of India, Central Recruitment & Promotion Department",
      section: "Photograph file type/size; Signature file type/size",
      lastVerified: "2026-10-07",
    },
  },
];

// ---------------------------------------------------------------- SSC
// SSC notices capture the photograph live in the application module and
// reject applications that photograph a pre-existing photo. Only the signature is uploaded.

const SSC_LIVE_RULES = [
  "You don't need a pre-existing photograph: the application module captures your photo when prompted",
  "Find a place with good light and a plain background",
  "Keep the camera at eye level, sit or stand directly in front of it and look straight ahead",
  "Keep your face fully inside the area marked by the camera, neither too close nor too far",
  "Don't wear a cap, mask or glasses/spectacles",
  "Never capture a photo of an existing photograph: such applications are rejected",
];

const SSC_SIGNATURE: ImageSpec = {
  kind: "signature",
  format: "JPEG/JPG",
  physical: "about 6.0 cm (width) × 2.0 cm (height)",
  aspect: 3,
  minKB: 10,
  maxKB: 20,
  rules: ["Upload a scanned signature", "Blurred or miniature signatures are rejected"],
};

const SSC_SETS: RequirementSet[] = [
  {
    id: "ssc-gd-2026",
    name: "SSC GD Constable: CAPFs, SSF and Rifleman (GD) in Assam Rifles",
    signature: {
      ...SSC_SIGNATURE,
      physical: "about 6.0 cm (width) × 2.0 cm (height) at 300 DPI",
      dpi: 300,
      rules: ["Upload a scanned signature", "Keep the signature horizontally aligned", "Blurred or miniature signatures are rejected"],
    },
    livePhotoCapture: {
      rules: [
        ...SSC_LIVE_RULES,
        "Keep your whole face inside the red rectangle the camera shows",
        "Don't wear earphones or any other device while the photo is taken",
      ],
    },
    notes: [
      "Applications submitted through Aadhaar-based authentication are not rejected on these photo and signature grounds.",
      "Without Aadhaar authentication, carry at least two recent passport-size colour photographs and an original photo ID with your date of birth to the exam hall.",
      "Candidates called for PET/PST go through biometric checks: the photo, left thumb impression and signature are matched with the data collected earlier.",
    ],
    source: {
      title: "SSC Constable (GD) notice",
      url: "https://cdn.s3waas.gov.in/s3e5841df2166dd424a57127423d276bbe/uploads/2025/12/17646730408096.pdf",
      publisher: "Staff Selection Commission (SSC)",
      section: "Paragraphs 8.3 to 8.7 and 13.9; Annexure II, Part II, items 20 and 21",
      lastVerified: "2026-11-14",
    },
  },
  {
    id: "ssc-cgle-2026",
    name: "Combined Graduate Level Examination, 2026",
    signature: SSC_SIGNATURE,
    livePhotoCapture: { rules: SSC_LIVE_RULES },
    notes: ["Applications submitted through Aadhaar-based authentication are not rejected on these photo and signature grounds."],
    source: {
      title: "Notice: Combined Graduate Level Examination, 2026",
      url: "https://ssc.gov.in/api/attachment/uploads/masterData/NoticeBoards/Notice_of_adv_cgl_2025.pdf",
      publisher: "Staff Selection Commission (SSC)",
      section: "Paragraphs 9.4 to 9.6",
      lastVerified: "2026-10-07",
    },
  },
  {
    id: "ssc-chsle-2026",
    name: "Combined Higher Secondary (10+2) Level Examination, 2026",
    signature: SSC_SIGNATURE,
    livePhotoCapture: { rules: SSC_LIVE_RULES },
    notes: ["Applications submitted through Aadhaar-based authentication are not rejected on these photo and signature grounds."],
    source: {
      title: "Notice: Combined Higher Secondary (10+2) Level Examination, 2026",
      url: "https://ssc.gov.in/api/attachment/uploads/masterData/NoticeBoards/Notice_of_adv_chsle_2026.pdf",
      publisher: "Staff Selection Commission (SSC)",
      section: "Paragraphs 9.4 to 9.6",
      lastVerified: "2026-10-07",
    },
  },
];

// ---------------------------------------------------------------- RRB
// RRB's NTPC 2026 notices (CEN 06/2026 Graduate, CEN 07/2026 Under Graduate) capture the photo live
// and accept no uploaded photograph; only the signature is uploaded. Both notices use identical wording.

const RRB_LIVE_RULES = [
  "No pre-existing photograph is uploaded: the application captures a live photo with your computer's webcam or your phone's front camera",
  "Use a pure plain white background; plain, preferably dark, clothes keep contrast with it",
  "Keep the camera at eye level, sit or stand directly in front of it and look straight ahead with a neutral expression",
  "Your head should take up at least 50% of the photo; elbows and anything below the chest must not be visible",
  "No cap, mask or glasses/spectacles; hair or cloth must not cover the face",
  "Eyes fully open; you can preview and retake the photo until the application is submitted",
];

const RRB_SIGNATURE: ImageSpec = {
  kind: "signature",
  format: "JPG/JPEG",
  widthPx: 140,
  heightPx: 60,
  pixelBasis: "minimum",
  physical: "fits the 35 mm × 20 mm scan box on the form",
  aspect: 140 / 60,
  minKB: 30,
  maxKB: 49,
  rules: [
    "Sign with a black ink pen on white paper",
    "Running handwriting (cursive, joined letters), NOT block, capital or disjointed letters",
    "Scan the signed paper at a minimum of 100 DPI",
    "Rejected: non-white background, non-black ink, an unclear or partly visible signature, or a thumb impression instead of a signature",
    "Must match the signature you give at the exams, document verification, medical examination and appointment",
  ],
};

const RRB_NOTES = ["SC/ST candidates asking for a free train travel pass also upload their SC/ST certificate as a PDF smaller than 400 KB."];

// Group D (Level 1, CEN 09/2025): the live-photo wording differs from NTPC (no white-background or 50%-head rule; it
// asks for non-white, preferably dark clothes), so it has its own list. The signature specification is identical.
const RRB_GROUP_D_LIVE_RULES = [
  "No pre-existing photograph is uploaded: the form captures a live photo with your webcam or your phone's front camera",
  "Wear non-white clothes, preferably dark, so you stand out from the background",
  "Keep the camera at eye level, sit or stand directly in front of it and look straight ahead with a neutral expression",
  "Your whole face must be clearly visible and centred in the frame the form shows, neither too close nor too far",
  "No cap, mask or glasses/spectacles",
  "Never photograph a printed or on-screen photo: such applications are rejected",
  "You can preview and retake the photo until the application is submitted",
];

const RRB_SETS: RequirementSet[] = [
  {
    id: "rrb-group-d-cen-09-2025",
    name: "Group D (Level 1): Track Maintainer, Pointsman and Assistant posts",
    signature: RRB_SIGNATURE,
    livePhotoCapture: { rules: RRB_GROUP_D_LIVE_RULES },
    notes: [
      ...RRB_NOTES,
      "Your appearance at every stage of the recruitment must match the live photo.",
      "Bring a colour passport photo no more than two months old to the CBT, PET, document verification and medical examination.",
    ],
    source: {
      title: "Centralised Employment Notice No. 09/2025: Level 1 posts (Group D)",
      url: "https://www.rrbcdg.gov.in/uploads/2025/09-LVL1/092025-CEN.pdf",
      publisher: "Railway Recruitment Boards (RRBs), Ministry of Railways",
      section: "Para 16.4 (live photo), 16.5.1 (signature) and 20.0 (g)",
      lastVerified: "2026-11-17",
    },
  },
  {
    id: "rrb-ntpc-graduate-cen-06-2026",
    name: "NTPC Graduate Level (CEN 06/2026)",
    signature: RRB_SIGNATURE,
    livePhotoCapture: { rules: RRB_LIVE_RULES },
    notes: RRB_NOTES,
    source: {
      title: "Centralised Employment Notice No. 06/2026: Non Technical Popular Categories (Graduate)",
      url: "https://rrb.indianrailways.gov.in/-/image/1791375679144CEN_06_2026_NTPC_G.pdf/examsDocuments",
      publisher: "Railway Recruitment Boards (RRBs), Ministry of Railways",
      section: "Para 14.4 (live photo) and 14.5 (scanned documents)",
      lastVerified: "2026-10-18",
    },
  },
  {
    id: "rrb-ntpc-undergraduate-cen-07-2026",
    name: "NTPC Under Graduate Level (CEN 07/2026)",
    signature: RRB_SIGNATURE,
    livePhotoCapture: { rules: RRB_LIVE_RULES },
    notes: RRB_NOTES,
    source: {
      title: "Centralised Employment Notice No. 07/2026: Non Technical Popular Categories (Under Graduate)",
      url: "https://rrb.indianrailways.gov.in/-/image/1791999622770Final_CEN_07-2026_14.10.2026_English.pdf/examsDocuments",
      publisher: "Railway Recruitment Boards (RRBs), Ministry of Railways",
      section: "Para 14.4 (live photo) and 14.5 (scanned documents)",
      lastVerified: "2026-10-18",
    },
  },
  {
    // Same live photo and signature wording as NTPC, except the scan box is 50 mm wide (NTPC: 35 mm).
    id: "rrb-station-master-cen-08-2026",
    name: "Station Master (CEN 08/2026)",
    signature: { ...RRB_SIGNATURE, physical: "fits the 50 mm × 20 mm scan box on the form" },
    livePhotoCapture: { rules: RRB_LIVE_RULES },
    notes: [
      ...RRB_NOTES,
      "If the live photo doesn't match your photo ID, the form asks you to upload Annexure VIII signed by a Gazetted Officer.",
    ],
    source: {
      title: "Centralised Employment Notice No. 08/2026: Station Master",
      url: "https://rrb.indianrailways.gov.in/-/image/1793016771817CEN_08_2026_StationMaster.pdf/examsDocuments",
      publisher: "Railway Recruitment Boards (RRBs), Ministry of Railways",
      section: "Para 16.5 (live photo) and 16.6 (scanned documents)",
      lastVerified: "2026-11-04",
    },
  },
];

// ---------------------------------------------------------------- RRC Central Railway
// Act Apprentices are engaged by the Railway Recruitment Cell, not the RRBs. The notice gives a print size and
// 100 DPI but no pixel size, so none is stored.

const RRC_SETS: RequirementSet[] = [
  {
    id: "rrc-cr-act-apprentice-2026",
    name: "Act Apprentices, Central Railway (RRC/CR/AA/2026, 2,861 slots)",
    photo: {
      kind: "photo",
      format: "JPG/JPEG",
      physical: "3.5 cm × 3.5 cm",
      aspect: 1,
      dpi: 100,
      minKB: 20,
      maxKB: 70,
      rules: [
        "Colour photograph taken not more than three months before the date of application",
        "Clear front view, without cap or sunglasses",
        "Applications can be rejected for an old or unclear photo, or one that differs significantly from how you look",
        "Keep two more copies of the same photo for document verification",
      ],
    },
    signature: {
      kind: "signature",
      format: "JPG/JPEG",
      physical: "3.5 cm × 3.5 cm",
      aspect: 1,
      dpi: 100,
      minKB: 20,
      maxKB: 30,
      rules: ["Upload your signature at 3.5 cm × 3.5 cm, 100 DPI"],
    },
    notes: [
      "Also uploaded: 10th mark sheet, date of birth proof, ITI consolidated mark sheet or provisional NTC, NCVT/SCVT trade certificate, and caste, PwBD or ex-serviceman certificates where they apply. The notice sets no format or size for these.",
      "Applications are made only on rrccr.com.",
    ],
    source: {
      title: "Notification No. RRC/CR/AA/2026: Engagement of Act Apprentices over Central Railway",
      url: "https://www.rrccr.com/rrwc/Files/7131ab94-6fc8-45c1-a2ed-f9191914dcbd.pdf",
      publisher: "Railway Recruitment Cell, Central Railway (RRC/CR)",
      section: "Paras 14–16",
      lastVerified: "2026-11-04",
    },
  },
];

// ---------------------------------------------------------------- Indian Bank
// The apprentice advertisement's Annexure II uses the same photo, signature, thumb and declaration wording as IBPS.

const INDIAN_BANK_SETS: RequirementSet[] = [
  {
    id: "indian-bank-apprentice-2026-27",
    name: "Engagement of Apprentices FY 2026-27 (1,500 seats)",
    photo: bankingPhoto(),
    signature: bankingSignature(),
    thumb: IBPS_THUMB,
    declaration: IBPS_DECLARATION,
    notes: [
      BANKING_LIVE_NOTE,
      "Register and complete your profile on the NATS 2.0 portal (nats.education.gov.in) before applying.",
      "A signature on the call letter or attendance sheet that doesn't match the uploaded one means disqualification.",
    ],
    source: {
      title: "Advertisement: Engagement of Apprentices for FY 2026-27",
      url: "https://indianbank.bank.in/documents/20117/34414/FINAL%20UPDATED%20ADVERTISEMENT%20FOR%20ENGAGEMENT%20OF%20APPRENTICES%20FOR%20FY%202026-27%20-%2004.11.20262026_11_04_04_14_20.pdf/451450a2-0501-51ba-e37c-db63b9c27425",
      publisher: "Indian Bank",
      section: "Annexure II: Guidelines for Scanning and Upload of Documents",
      lastVerified: "2026-11-04",
    },
  },
];

// ---------------------------------------------------------------- Driving licence (Parivahan Sarathi)
// Sarathi's own "Photo and Signature Scan & Upload Process" PDF. Some states take the photo from Aadhaar e-KYC instead.

const SARATHI_SETS: RequirementSet[] = [
  {
    id: "sarathi-dl-ll",
    name: "Driving licence and learner's licence applications (Sarathi)",
    photo: {
      kind: "photo",
      format: "JPG",
      widthPx: 420,
      heightPx: 525,
      pixelBasis: "preferred",
      physical: "35 mm × 45 mm",
      aspect: 420 / 525,
      minKB: 10,
      maxKB: 20,
      rules: [
        "Recent (within 6 months) passport-size colour picture",
        "Light-coloured, preferably white, background",
        "Caps, hats and dark glasses are not acceptable; religious headwear is allowed but must not cover the face",
        "Minimum 420 × 525 pixels; 420 × 525 is the preferred size",
      ],
    },
    signature: {
      kind: "signature",
      format: "JPG",
      widthPx: 256,
      heightPx: 64,
      pixelBasis: "preferred",
      aspect: 256 / 64,
      minKB: 10,
      maxKB: 20,
      rules: ["Sign on white paper with a black pen"],
    },
    notes: [
      "Services vary by state: some states fetch your photo from Aadhaar e-KYC, so check what your state's upload screen asks for.",
      "Scan or photograph at 300 DPI or more, in true colour.",
    ],
    source: {
      title: "Photo and Signature Scan & Upload Process",
      url: "https://sarathi.parivahan.gov.in/sarathiservice/pdf/PhotoSign.pdf",
      publisher: "Ministry of Road Transport & Highways (Parivahan Sarathi)",
      section: "Page 2: Photograph and Signature",
      lastVerified: "2026-11-13",
    },
  },
];

// ---------------------------------------------------------------- Voter ID (Election Commission of India)
// Form 6 (new voter) and Form 8 (correction) on voters.eci.gov.in. ECI gives a print size and a 2 MB limit, no pixels.

const ECI_SETS: RequirementSet[] = [
  {
    id: "eci-form-6",
    name: "Voter ID: Form 6 (new voter) and Form 8 (photo change)",
    photo: {
      kind: "photo",
      format: "JPG/JPEG",
      physical: "4.5 cm × 3.5 cm",
      aspect: 35 / 45,
      maxKB: 2000,
      rules: [
        "Recent, good-quality, unsigned passport-size colour photograph",
        "White background, showing a front view of the full face",
        "Eyes open and both edges of the face clearly visible",
      ],
    },
    notes: ["Form 6 asks for no signature upload.", "Apply on voters.eci.gov.in or the Voter Helpline app."],
    source: {
      title: "Guidelines for filling Form 6",
      url: "https://voters.eci.gov.in/guidelines/Form-6_en.pdf",
      publisher: "Election Commission of India",
      section: "Item (d) Photograph; the portal's upload field adds the 2 MB JPG limit",
      lastVerified: "2026-11-13",
    },
  },
];

// ---------------------------------------------------------------- KEA (Karnataka)
// Group-C FDA/SDA 2026. The notices are Kannada scans; the upload rule is the English text inside para 25 (FDA)
// and para 23 (SDA), identical in both. No pixel size is given.

const KEA_SETS: RequirementSet[] = [
  {
    id: "kea-fda-sda-2026",
    name: "Group-C FDA, SDA and equivalent posts 2026 (5,431 posts)",
    photo: {
      kind: "photo",
      format: "JPEG",
      minKB: 50,
      maxKB: 200,
      rules: ["Recent passport-size photograph", "White background"],
    },
    signature: {
      kind: "signature",
      format: "JPEG",
      minKB: 50,
      maxKB: 70,
      rules: ["Sign on white paper with a black sketch or marker pen, then scan it"],
    },
    notes: [
      "Applications without the photograph and signature are rejected.",
      "Covers the Residual Parent Cadre (FDA and SDA) and Kalyana Karnataka notices; apply on cetonline.karnataka.gov.in/kea.",
    ],
    source: {
      title: "Notification: First Division Assistant and equivalent posts (RPC), 2026 (Kannada)",
      url: "https://cetonline.karnataka.gov.in/keawebentry456/gpcfdasdarpc2026/RPC_FDAkannada.pdf",
      publisher: "Karnataka Examinations Authority (KEA)",
      section: "Para 25 (para 23 of the SDA notice)",
      lastVerified: "2026-11-04",
    },
  },
];

// ---------------------------------------------------------------- AFCAT (Indian Air Force)
// AFCAT 01/2027 notification: section "Instructions regarding scanning of Photograph, Signature & Thumb
// Impression", para 7.6 and the upload table (item 10). KB ranges and file names only; no pixel size.

const AFCAT_SETS: RequirementSet[] = [
  {
    id: "afcat-01-2027",
    name: "AFCAT 01/2027: Flying, Ground Duty (Technical and Non-Technical), NCC Special Entry and GATE score entry",
    photo: {
      kind: "photo",
      format: "JPG/JPEG",
      minKB: 100,
      maxKB: 200,
      fileName: "Passport Photograph.jpg",
      rules: [
        "Recent passport-size colour photograph with a light background",
        "Look straight at the camera with a relaxed face",
        "Front portrait without headgear, except for Sikhs; not attested",
        "Name the file Passport Photograph.jpg",
      ],
    },
    signature: {
      kind: "signature",
      format: "JPG/JPEG",
      minKB: 80,
      maxKB: 150,
      fileName: "Signature.jpg",
      rules: ["Sign on white paper with a black ink pen", "Scan the signature area only, not the whole page", "Name the file Signature.jpg"],
    },
    thumb: {
      kind: "thumb",
      label: "Thumb impression",
      format: "JPG/JPEG",
      minKB: 50,
      maxKB: 100,
      fileName: "Thumb Impression.jpg",
      rules: [
        "Men upload the left thumb, women the right thumb",
        "Press the thumb on an ink stamp pad, then on plain blank paper",
        "Name the file Thumb Impression.jpg",
      ],
    },
    livePhotoCapture: { rules: ["The form also captures a live image of you through your device camera"] },
    notes: ["Apply on afcat.edcil.co.in from 12 November (11 am) to 11 December 2026 (11:30 pm). The online exam is on 31 January 2027."],
    source: {
      title: "Notification for AFCAT 01/2027",
      url: "https://afcat.edcil.co.in/assets/images/news/Notification%20for%20AFCAT%2001%20of%202027%20Final.pdf",
      publisher: "Indian Air Force",
      section: "Instructions for scanning the photograph, signature and thumb impression; para 7.6; upload table, item 10",
      lastVerified: "2026-11-14",
    },
  },
];

// ---------------------------------------------------------------- UP Police (UPPRPB)
// Constable notice PRPB-B-07 (Hindi scan): para 5.7 (live photograph) and para 5.8 (signature, page 24).
// The signature may be 50 mm × 20 mm or 140 × 60 px, so 140 × 60 is treated as preferred: a 140 × 60
// JPEG can't reach the 30 KB minimum, and the tool then offers a larger image with the same shape.

const UP_POLICE_SETS: RequirementSet[] = [
  {
    id: "up-police-constable",
    name: "UP Police Constable: Civil Police, PAC/Armed Police, Special Security Force, Mounted Police and Jail Warder",
    signature: {
      kind: "signature",
      format: "JPG/JPEG",
      widthPx: 140,
      heightPx: 60,
      pixelBasis: "preferred",
      physical: "50 mm × 20 mm",
      aspect: 140 / 60,
      minKB: 30,
      maxKB: 50,
      rules: [
        "Sign with a black ink pen on white paper, inside a 50 mm × 20 mm box",
        "Running letters (joined handwriting), not block letters",
        "Only your own signature, nobody else's",
      ],
    },
    livePhotoCapture: {
      rules: [
        "The form takes a real-time photo with a webcam or another camera; no photo file is uploaded",
        "No cap: a photo with a cap is not accepted",
        "Nothing may cover your face: no mask, hair, cloth, shadow or jewellery",
        "If you wear glasses, make sure no reflection or light falls on them and your eyes are clearly visible",
        "The photo must not be blurred or have strong glare",
        "Don't wear any uniform: an application with a uniform in the photo is not accepted",
      ],
    },
    notes: [
      "If your live photo doesn't match your Aadhaar photo, you must fill in a declaration in the online form; without Aadhaar, a self-declaration is required.",
      "Register first on the board's One Time Registration (OTR) with a unique email ID and mobile number, verified through DigiLocker; neither can be changed later.",
      "Don't wear any uniform at any stage of the recruitment, including the written exam.",
    ],
    source: {
      title: "UPPRPB notice: Constable (Civil Police) and equivalent posts",
      url: "https://uppbpb.gov.in/FilesUploaded/Notice/CONSTABLE-VIGYAPTIc7be0cc8-3365-471e-9237-447c528d341a.pdf",
      publisher: "Uttar Pradesh Police Recruitment and Promotion Board (UPPRPB)",
      section: "Para 5.7 (photograph) and 5.8 (signature), in Hindi",
      lastVerified: "2026-11-14",
    },
  },
];

// ---------------------------------------------------------------- UKSSSC (Uttarakhand)
// Advt. 84/2026 (uniformed constable, 1,694 posts) para 18(v) and Advt. 85/2026 (uniformed sub inspector, 200 posts)
// para 19(v), both Hindi scans with identical wording: the photo is captured live with face detection; the signature
// and the left thumb impression are uploaded as JPG/JPEG of 150 (w) × 100 (h) px. No KB limit is stated.

const UKSSSC_SIGNATURE: ImageSpec = {
  kind: "signature",
  format: "JPG/JPEG",
  widthPx: 150,
  heightPx: 100,
  pixelBasis: "stated",
  aspect: 150 / 100,
  rules: ["Upload as JPG/JPEG, 150 px wide × 100 px high"],
};

const UKSSSC_THUMB: ImageSpec = {
  kind: "thumb",
  format: "JPG/JPEG",
  widthPx: 150,
  heightPx: 100,
  pixelBasis: "stated",
  aspect: 150 / 100,
  rules: ["A clear impression of your left thumb, for biometric verification", "Upload as JPG/JPEG, 150 px wide × 100 px high"],
};

const UKSSSC_LIVE_RULES = [
  "The photo is taken live with your camera (live photo capture); no photo file is uploaded",
  "Your face must be clearly visible to the camera: the system confirms it by face detection",
  "Take it in clear, sufficient light, with your face placed properly inside the frame shown",
];

const UKSSSC_NOTES = [
  "Register with your Aadhaar number; one Aadhaar can be used only once. Use your own mobile number and email ID.",
  "To verify your name and date of birth, upload your High School certificate and a copy of both sides of your Aadhaar card.",
  "Also upload the certificates for any reservation category or sub-category you claim, and your hill area (parvatiya kshetra) certificate.",
];

const UKSSSC_SETS: RequirementSet[] = [
  {
    id: "uksssc-constable-84-2026",
    name: "Uniformed Constable (Group C), Advt. 84/UKSSSC/2026: police, PAC/IRB, fireman, forest guard, jail warder and others (1,694 posts)",
    signature: UKSSSC_SIGNATURE,
    thumb: UKSSSC_THUMB,
    livePhotoCapture: { rules: UKSSSC_LIVE_RULES },
    notes: [...UKSSSC_NOTES, "Apply online on sssc.uk.gov.in from 25 November to 25 December 2026; corrections from 28 to 30 December 2026."],
    source: {
      title: "UKSSSC Advertisement No. 84/2026: Uniformed Constable (Group C)",
      url: "https://cdnbbsr.s3waas.gov.in/s34ffd0e19d2069412274bd3025b0e176c/uploads/2026/11/20261117947374675.pdf",
      publisher: "Uttarakhand Subordinate Service Selection Commission (UKSSSC)",
      section: "Para 18(v), page 24, in Hindi",
      lastVerified: "2026-11-26",
    },
  },
  {
    id: "uksssc-sub-inspector-85-2026",
    name: "Uniformed Sub Inspector (Group C), Advt. 85/UKSSSC/2026: SI civil police and intelligence, Platoon Commander and others (200 posts)",
    signature: UKSSSC_SIGNATURE,
    thumb: UKSSSC_THUMB,
    livePhotoCapture: { rules: UKSSSC_LIVE_RULES },
    notes: [...UKSSSC_NOTES, "Apply online on sssc.uk.gov.in from 1 December to 31 December 2026; corrections from 4 to 6 January 2027."],
    source: {
      title: "UKSSSC Advertisement No. 85/2026: Uniformed Sub Inspector (Group C)",
      url: "https://cdnbbsr.s3waas.gov.in/s34ffd0e19d2069412274bd3025b0e176c/uploads/2026/11/202611251036354999.pdf",
      publisher: "Uttarakhand Subordinate Service Selection Commission (UKSSSC)",
      section: "Para 19(v), page 12, in Hindi",
      lastVerified: "2026-11-26",
    },
  },
];

// ---------------------------------------------------------------- Gujarat Police (GPRB, applications on OJAS)
// GPRB's detailed advertisement for the 2025 Lokrakshak/PSI recruitment (page 1, in Gujarati) asks for a recent colour
// passport-size photo and a signature, each a JPG of at most 15 KB. The print sizes, 5 cm × 3.6 cm (photo) and
// 2.5 cm × 7.5 cm (signature), are printed on the OJAS upload screen (OJAS "How to Apply" guide, page 16). Pixel sizes
// are derived by the tool at 150 DPI, which keeps both files clear within 15 KB. The 2026-27 recruitment (newspaper
// advertisement dated 19 Nov 2026) takes applications on OJAS from 26 Nov to 16 Dec 2026; its detailed instructions
// are due on OJAS on 26 Nov 2026.

const GUJARAT_POLICE_SETS: RequirementSet[] = [
  {
    id: "gprb-lokrakshak-technical-2026-27",
    name: "Gujarat Police Lokrakshak (UPC, APC, SRPF constable) and Technical Cadre 2026-27, GPRB/202627/1–3",
    photo: {
      kind: "photo",
      format: "JPG",
      physical: "5 cm (height) × 3.6 cm (width)",
      widthPx: 213,
      heightPx: 295,
      pixelBasis: "derived",
      aspect: 213 / 295,
      dpi: 150,
      maxKB: 15,
      rules: ["Recent colour passport-size photograph", "Quality good enough for you to be identified"],
    },
    signature: {
      kind: "signature",
      format: "JPG",
      physical: "2.5 cm (height) × 7.5 cm (width)",
      widthPx: 443,
      heightPx: 148,
      pixelBasis: "derived",
      aspect: 443 / 148,
      dpi: 150,
      maxKB: 15,
      rules: ["Clearly legible", "Sign on white paper with a dark pen, then scan or photograph it"],
    },
    notes: [
      "3,000 posts: 2,841 Lokrakshak (1,000 unarmed, 1,000 armed and 841 SRPF constables), 133 Head Constable Driver Mechanic and 26 Motor Transport Supervisor.",
      "Apply online only, on ojas.gujarat.gov.in, from 26 November 2026 (2 pm) to 16 December 2026 (11:59 pm); each cadre needs a separate application.",
      "If you applied with an OJAS One Time Registration (OTR) number, your photo and signature are already on file; upload again only to change them.",
      "Confirm the application after uploading and keep a printout; the board asks for it later.",
    ],
    source: {
      title: "GPRB detailed advertisement: PSI and Lokrakshak Cadre recruitment 2025 (photo and signature rules)",
      url: "https://gprb.gujarat.gov.in/ViewDocument.aspx?CDID=f62cf2f26b5aeaa2e350645cae6581cb",
      publisher: "Gujarat Police Recruitment Board (GPRB)",
      section: "Page 1 (15 KB JPG photo and signature, in Gujarati); sizes from the OJAS upload screen (How to Apply guide, page 16); dates from the newspaper advertisement of 19 Nov 2026",
      lastVerified: "2026-11-25",
    },
  },
];

// ---------------------------------------------------------------- India Post GDS
// GDS Online Engagement instructions (Annexure II, para 5). Pixel sizes are "recommended", so they are
// treated as preferred: a clean 300 × 120 signature can't reach 20 KB, and the tool offers a larger copy.

const GDS_SETS: RequirementSet[] = [
  {
    id: "india-post-gds",
    name: "Gramin Dak Sevak online engagement: Branch Postmaster, Assistant Branch Postmaster and Dak Sevak",
    photo: {
      kind: "photo",
      format: "JPG/JPEG",
      widthPx: 320,
      heightPx: 400,
      pixelBasis: "preferred",
      aspect: 4 / 5,
      dpi: 150,
      minKB: 30,
      maxKB: 100,
      rules: [
        "Recent photograph on a plain white or light-coloured background",
        "Face fills 70–80% of the image, centred, with no shadows or red-eye",
        "Clear, well-lit and in focus; don't upload a scanned photo or a selfie",
        "72 to 150 DPI",
      ],
    },
    signature: {
      kind: "signature",
      format: "JPG/JPEG",
      widthPx: 300,
      heightPx: 120,
      pixelBasis: "preferred",
      aspect: 5 / 2,
      dpi: 150,
      minKB: 20,
      maxKB: 100,
      rules: [
        "Sign on white paper with a black or blue pen and scan it",
        "The signature fills 70–80% of the image, completely inside the frame",
        "Plain white background, no shadows, borders or extra marks",
        "Not typed or digital text; clear, not shaky or pixelated",
        "72 to 150 DPI",
      ],
    },
    notes: [
      "Blurred photographs and blurred or miniature signatures lead to rejection.",
      "Register once (One-Time Registration) on indiapost.gov.in/gdsonlineengagement with your own mobile number and email, then apply.",
      "Check the preview after uploading: the photo and signature can't be replaced after final submission.",
    ],
    source: {
      title: "GDS Online Engagement: instructions for applicants (Annexure II)",
      url: "https://indiapost.gov.in/gdsonlineengagement/pdf/Annexure-II.pdf",
      publisher: "Department of Posts (India Post), Government of India",
      section: "Para 5: Uploading of photographs and signature",
      lastVerified: "2026-11-15",
    },
  },
];

// ---------------------------------------------------------------- MHT CET (Maharashtra State CET Cell)
// Information Brochure, "Photo Specifications": a photograph only (no signature upload is listed), 2 × 2 inch,
// 100 KB to 5 MB. No pixel size or file format is stated, so neither is set here.

const MHT_CET_SETS: RequirementSet[] = [
  {
    id: "mht-cet",
    name: "MHT CET (PCM and PCB groups)",
    photo: {
      kind: "photo",
      physical: "2 inch × 2 inch (50 mm × 50 mm)",
      aspect: 1,
      minKB: 100,
      maxKB: 5120,
      faceCoverage: 80,
      rules: [
        "Recent colour photograph; the face covers 80% of the photo",
        "Full face, front view, eyes open, neutral expression, head centred",
        "Full head visible, from the top of the hair to the bottom of the chin, with both edges of the face",
        "Plain light-coloured or white background, evenly lit, with no shadows on the face or background",
        "No head covering except for religious reasons, with the face from chin to forehead fully visible",
        "No tinted or dark glasses; tilt your head slightly to avoid glare on clear glasses",
        "Upload a high-resolution, clear picture",
      ],
    },
    notes: [
      "The brochure asks only for a photograph; it lists no signature upload.",
      "Registration uses Aadhaar authentication and APAAR ID verification through DigiLocker, so keep your Aadhaar details (including the photo) up to date.",
    ],
    source: {
      title: "MHT-CET Information Brochure (State CET Cell, Maharashtra)",
      url: "https://cetcell.mahacet.org/wp-content/uploads/2023/12/MHT-CET-2026-Information-Brochure-Updated-on-11.04.2026.pdf",
      publisher: "State Common Entrance Test Cell, Government of Maharashtra",
      section: "Photo Specifications (brochure pages 8–9)",
      lastVerified: "2026-11-16",
    },
  },
];

// ---------------------------------------------------------------- KCET (KEA UGCET)
// KEA's UGCET simple guide ("Saral Diksuchi", Kannada, one page), section "What documents do you need to apply?":
// photo and signature as JPG, each under 50 KB. The Information Bulletin gives no upload sizes, and no pixel size or
// thumb-impression upload is stated, so none is set here.

const KCET_SETS: RequirementSet[] = [
  {
    id: "kcet-ugcet",
    name: "KCET (UGCET): engineering, agriculture, pharmacy, nursing and other professional courses",
    photo: { kind: "photo", format: "JPG", maxKB: 50, rules: ["The student's photograph, in JPG format"] },
    signature: { kind: "signature", format: "JPG", maxKB: 50, rules: ["The student's own signature, in JPG format"] },
    notes: [
      "Also keep ready: the SSLC / 10th marks card, the Aadhaar card and certificates, and the student's own mobile number (with WhatsApp) and email ID.",
      "The name must be written the same way on the SSLC marks card, the Aadhaar card and the RD certificates; correct any mismatch, following the SSLC marks card, before applying.",
    ],
    source: {
      title: "UGCET simple guide (Saral Diksuchi), Karnataka Examinations Authority",
      url: "https://cetonline.karnataka.gov.in/keawebentry456/ugcet2026/ugcet_2026_inog_diksuchi_KAN_16012026kannada.pdf",
      publisher: "Karnataka Examinations Authority (KEA)",
      section: "Documents needed to apply (in Kannada)",
      lastVerified: "2026-11-17",
    },
  },
];

// ---------------------------------------------------------------- PAN card (Protean / NSDL)
// Protean's PAN instructions (Form 49A with DSC, same table on the correction page) list the scanning specification:
// 200 DPI, colour, JPEG; photo max 20 KB, "3.5X2.5 cms"; signature max 10 KB, "2X4.5 cms". Both are written height
// first (the PAN photo box is portrait), so the photo is 2.5 cm wide and the signature 4.5 cm wide. Pixels are our
// conversion at the stated 200 DPI. UTIITSL publishes no specification on its public pages, so it isn't listed.

const PAN_SETS: RequirementSet[] = [
  {
    id: "pan-protean",
    name: "PAN card: new PAN (Form 49A) and changes or correction, Protean (NSDL) online application",
    photo: {
      kind: "photo",
      format: "JPEG",
      physical: "2.5 cm (width) × 3.5 cm (height)",
      widthPx: 197,
      heightPx: 276,
      pixelBasis: "derived",
      aspect: 197 / 276,
      dpi: 200,
      maxKB: 20,
      rules: ["Scanned in colour at 200 DPI", "Recent colour photograph"],
    },
    signature: {
      kind: "signature",
      format: "JPEG",
      physical: "4.5 cm (width) × 2 cm (height)",
      widthPx: 354,
      heightPx: 157,
      pixelBasis: "derived",
      aspect: 354 / 157,
      dpi: 200,
      maxKB: 10,
      rules: ["Scanned in colour at 200 DPI"],
    },
    notes: [
      "Protean writes the sizes as 3.5 × 2.5 cm (photo) and 2 × 4.5 cm (signature); pixels are our conversion at the stated 200 DPI.",
      "Supporting documents (proof of identity, address and date of birth): black and white, 200 DPI, PDF/A or JPEG, up to 300 KB per page.",
    ],
    source: {
      title: "PAN application instructions (Form 49A, Protean)",
      url: "https://tin.tin.proteantech.in/pan/form49Adsc.html",
      publisher: "Protean eGov Technologies (formerly NSDL e-Gov), for the Income Tax Department",
      section: "Scanning specifications table: photograph, signature and supporting documents",
      lastVerified: "2026-11-18",
    },
  },
];

// ---------------------------------------------------------------- Indian visa
// The visa site's "Online Visa Photo Upload Process" (VSS_IMAGE.pdf), section 2(b): JPEG, 10–300 KB, height and
// width equal, at least 350 × 350 and at most 1000 × 1000 pixels. The tool makes the 350 × 350 minimum, which is inside
// that range. The e-Visa page (evisa/tvoa.html) asks for a recent front-facing photograph with a white background
// but publishes no pixel or KB limits on its public pages, so none are claimed for it.

const INDIA_VISA_SETS: RequirementSet[] = [
  {
    id: "india-visa-online",
    name: "Indian visa: online visa application (indianvisaonline.gov.in)",
    photo: {
      kind: "photo",
      format: "JPEG",
      widthPx: 350,
      heightPx: 350,
      pixelBasis: "minimum",
      aspect: 1,
      minKB: 10,
      maxKB: 300,
      rules: [
        "Height and width must be equal (a square photo)",
        "At least 350 × 350 pixels and at most 1000 × 1000 pixels",
        "Taken with a digital camera or webcam, or a scanned photograph",
      ],
    },
    notes: [
      "e-Visa (e-Tourist, e-Business, e-Medical and others): the e-Visa page asks for a recent, front-facing photograph with a white background, uploaded with the passport's photo page. Its public pages state no pixel or KB limits; check the upload screen of the form.",
    ],
    source: {
      title: "Online Visa Photo Upload Process (Government of India visa site)",
      url: "https://indianvisaonline.gov.in/visa/VSS_IMAGE.pdf",
      publisher: "Indian Visa Online, Government of India",
      section: "2(b) Photograph parameters for the online visa registration",
      lastVerified: "2026-11-20",
    },
  },
];

// ---------------------------------------------------------------- UPSSSC
// From 14 July 2026, One Time Registration (OTR) is compulsory for every UPSSSC exam; the photo and
// signature are uploaded once, in the OTR. The notice states file sizes and formats, but no pixel size.

const UPSSSC_SETS: RequirementSet[] = [
  {
    id: "upsssc-otr-2026",
    name: "One Time Registration (OTR), used for PET and every later UPSSSC exam",
    photo: {
      kind: "photo",
      format: "JPEG/JPG",
      minKB: 50,
      maxKB: 100,
      rules: ["Recent colour photograph, taken within the last 6 months"],
    },
    signature: {
      kind: "signature",
      format: "JPEG/JPG",
      minKB: 30,
      maxKB: 50,
      rules: [
        "Sign in Hindi or English",
        "Below the signature, write your name in Hindi in your own handwriting",
        "Signatures in English CAPITAL LETTERS are invalid",
      ],
    },
    notes: [
      "OTR details can't be changed after the registration number is issued, apart from what the commission allows in its 31 July 2026 notice.",
      "Mains applications reuse earlier uploads: for the Inter (12th) Level exam (advertisement 26-Exam/2026), the photo and signature uploaded for PET-2025 are shown automatically and can't be changed.",
    ],
    source: {
      title: "Notice No. 45/17/Vigyapan Anubhag (11)/2026/O.T.R./2026: start of One Time Registration (OTR)",
      url: "https://upsssc.gov.in/ViewPdf.aspx?YLZ1tKAtaiY6scDDR94IWt29SFu57FbUHrV3uMfCnjw=",
      publisher: "Uttar Pradesh Subordinate Services Selection Commission (UPSSSC)",
      section: "Points 8 and 9 (dated 14 July 2026, in Hindi)",
      lastVerified: "2026-10-18",
    },
  },
];

// ---------------------------------------------------------------- DSSSB
// DSSSB's 2026 advertisements describe the photo but give no file size or pixel size for the photo or
// signature (those are shown in the OARS portal). They do specify the scanned photo ID proof, kept in notes.

const DSSSB_PHOTO: ImageSpec = {
  kind: "photo",
  rules: [
    "Recent and clear colour photograph",
    "Plain white or off-white background",
    "Full face, front view, eyes open",
    "Bring the same photo printed on photo-quality paper whenever the Board asks for it",
  ],
};

const DSSSB_SIGNATURE: ImageSpec = {
  kind: "signature",
  rules: ["Blurred or illegible signatures lead to rejection of the online application"],
};

const DSSSB_NOTES = [
  "The advertisement doesn't state a file size or pixel size for the photo or signature; follow the limits the OARS upload screen shows.",
  "Registration also needs a scanned photo ID (PAN, voter ID, driving licence or passport) as JPG/JPEG, between 15 KB and 60 KB, at least 300 × 200 px for PAN or driving licence, 200 × 300 px for a voter card and 450 × 350 px for a passport. Not needed if you give your Aadhaar number.",
];

const DSSSB_SETS: RequirementSet[] = [
  {
    id: "dsssb-advt-06-2026",
    name: "Advertisement 06/2026: Junior Engineer (Electrical) and Multi Tasking Staff (1,260 posts)",
    photo: DSSSB_PHOTO,
    signature: DSSSB_SIGNATURE,
    notes: [...DSSSB_NOTES, "Apply on dsssbonline.nic.in from 12 November to 11 December 2026 (11:59 pm)."],
    source: {
      title: "Vacancy Notice / Advertisement No. 06/2026",
      url: "https://dsssb.delhi.gov.in/sites/default/files/DSSSB/circulars-orders/final_advt_06_2026_j_e_electrical_mts.pdf",
      publisher: "Delhi Subordinate Services Selection Board (DSSSB), Government of NCT of Delhi",
      section: "General instructions (viii) and Annexure II (points 3 and 13)",
      lastVerified: "2026-11-14",
    },
  },
  {
    id: "dsssb-advt-04-2026",
    name: "Advertisement 04/2026: Combined Examination 2026 (Senior PA, Junior Judicial Assistant, Process Server, Peon and others)",
    photo: DSSSB_PHOTO,
    signature: DSSSB_SIGNATURE,
    notes: DSSSB_NOTES,
    source: {
      title: "Vacancy Notice / Advertisement No. 04/2026",
      url: "https://dsssb.delhi.gov.in/sites/default/files/DSSSB/circulars-orders/final_adv_1.pdf",
      publisher: "Delhi Subordinate Services Selection Board (DSSSB), Government of NCT of Delhi",
      section: "How to apply (points 3 and 13) and general instructions (viii)",
      lastVerified: "2026-10-18",
    },
  },
  {
    id: "dsssb-advt-05-2026",
    name: "Advertisement 05/2026: Sweeper and Chowkidar",
    photo: DSSSB_PHOTO,
    signature: DSSSB_SIGNATURE,
    notes: DSSSB_NOTES,
    source: {
      title: "Vacancy Notice / Advertisement No. 05/2026",
      url: "https://dsssb.delhi.gov.in/sites/default/files/DSSSB/circulars-orders/final_advt_05_2026_1.pdf",
      publisher: "Delhi Subordinate Services Selection Board (DSSSB), Government of NCT of Delhi",
      section: "How to apply (points 3 and 13) and general instructions (viii)",
      lastVerified: "2026-10-18",
    },
  },
];

// ---------------------------------------------------------------- NEET (UG)

const NEET_SETS: RequirementSet[] = [
  {
    id: "neet-ug-2026",
    name: "NEET (UG) 2026",
    photo: {
      kind: "photo",
      format: "JPG/JPEG",
      minKB: 10,
      maxKB: 200,
      faceCoverage: 80,
      rules: [
        "Recent passport-size photograph, in colour or black & white",
        "Taken after 01 January 2026",
        "White background",
        "Face without mask, ears visible; about 80% of the image should be the face",
        "Spectacles only if worn regularly",
        "Polaroid and computer-generated photos are not acceptable",
      ],
    },
    signature: { kind: "signature", format: "JPG/JPEG", minKB: 10, maxKB: 100, rules: ["Upload a scanned signature, clearly legible"] },
    notes: [
      "The bulletin does not specify pixel dimensions for the photograph; it specifies the format and file size.",
      "A live photograph is also captured during the application and matched with your Aadhaar record.",
      "Use the same passport-size photo for the form and for the attendance sheet; keep 6–8 passport-size and 4–6 postcard-size (4\" × 6\") colour photos with a white background.",
    ],
    source: {
      title: "Information Bulletin NEET (UG)-2026",
      url: "https://neet.nta.nic.in/document/information-bulletin-english/",
      publisher: "National Testing Agency (NTA)",
      section: "Upload scanned images (photograph, signature) and live photograph instructions",
      lastVerified: "2026-10-07",
    },
  },
];

// ---------------------------------------------------------------- JEE (Main)
// The 2027 bulletin asks for both a live photograph and an uploaded scanned photograph, so the
// photo spec stays and the live capture is described in the notes (as for NEET).

const JEE_SETS: RequirementSet[] = [
  {
    id: "jee-main-2027",
    name: "JEE (Main) 2027, Sessions 1 and 2",
    photo: {
      kind: "photo",
      format: "JPG/JPEG",
      minKB: 10,
      maxKB: 200,
      faceCoverage: 80,
      rules: [
        "Recent scanned passport-size photograph, in colour",
        "White background",
        "80% of the photo is the face, including ears, without a mask",
        "Clearly legible",
      ],
    },
    signature: { kind: "signature", format: "JPG/JPEG", minKB: 10, maxKB: 100, rules: ["Clearly legible"] },
    notes: [
      "The bulletin gives no pixel size for the photograph or the signature, only the format and file size.",
      "A live photograph is also captured while you fill in the form, with your camera or webcam, or with a phone through the QR code if your device has no webcam: white background, proper lighting, 80% face visibility including ears, no mask.",
      "The Class 10 (or equivalent) certificate or marksheet is uploaded as a PDF of 50–300 KB; so are a disability/UDID certificate and, for foreign nationals, the non-Indian passport, where they apply.",
      "Carry 2 more passport-size photographs, the same as the uploaded one, to paste on the admit card and the attendance sheet at the exam.",
      "The same application number is used for Session 2; uploads can't be changed after the correction window closes.",
    ],
    source: {
      title: "Information Bulletin: Joint Entrance Examination (Main) – 2027",
      url: "https://cdnbbsr.s3waas.gov.in/s3f8e59f4b2fe7c5705bf878bbd494ccdf/uploads/2026/10/202610241890224107.pdf",
      publisher: "National Testing Agency (NTA)",
      section: "Instructions for filling in the online application form, Step 2 (bulletin page 8)",
      lastVerified: "2026-10-25",
    },
  },
];

// ---------------------------------------------------------------- CUET (UG)
// Pre-built from the CUET (UG) 2026 bulletin; the 2027 bulletin is expected around January 2027.
// CUET (PG) is left out until NTA itself publishes a bulletin we can read (the 2026 PG KB limits were
// only found on university mirrors).

const CUET_SETS: RequirementSet[] = [
  {
    id: "cuet-ug-2026",
    name: "CUET (UG)",
    photo: {
      kind: "photo",
      format: "JPG/JPEG",
      minKB: 10,
      maxKB: 200,
      faceCoverage: 80,
      rules: [
        "Recent scanned passport-size photograph, in colour",
        "White background",
        "80% of the photo is the face, including ears, without a mask",
        "Clearly legible",
      ],
    },
    signature: { kind: "signature", format: "JPG/JPEG", minKB: 10, maxKB: 50, rules: ["Clearly legible"] },
    notes: [
      "The bulletin gives no pixel size for the photograph or the signature, only the format and file size.",
      "A live photograph is also captured while you fill in the form, with your camera or webcam, or with a phone through the QR code: light-coloured background, proper lighting, 80% face visibility including ears, no mask.",
      "A disability/UDID certificate is uploaded as a PDF of 50–300 KB; an identity proof (if you don't verify through Aadhaar or DigiLocker) as a JPG/JPEG of 10–200 KB.",
    ],
    source: {
      title: "CUET (UG) Information Bulletin (NTA)",
      url: "https://cdnbbsr.s3waas.gov.in/s3d1a21da7bca4abff8b0b61b87597de73/uploads/2026/01/202601031633478370.pdf",
      publisher: "National Testing Agency (NTA)",
      section: "Upload scanned images of the photograph, signature and disability/UDID certificate (bulletin page 8)",
      lastVerified: "2026-11-14",
    },
  },
];

// ---------------------------------------------------------------- CTET
// Pre-built from the CTET September 2026 bulletin (CBSE); the next session's bulletin may come in late 2026.
// Sizes are given in cm and KB; no pixel size.

const CTET_SETS: RequirementSet[] = [
  {
    id: "ctet-sep-2026",
    name: "CTET (Paper I and Paper II)",
    photo: {
      kind: "photo",
      format: "JPG/JPEG",
      physical: "3.5 cm (width) × 4.5 cm (height)",
      aspect: 3.5 / 4.5,
      minKB: 10,
      maxKB: 100,
      rules: ["Latest scanned photograph", "Uploading the photo is mandatory"],
    },
    signature: {
      kind: "signature",
      format: "JPG/JPEG",
      physical: "3.5 cm (length) × 1.5 cm (height)",
      aspect: 3.5 / 1.5,
      minKB: 3,
      maxKB: 30,
      rules: ["Scanned signature", "Uploading the signature is mandatory"],
    },
    notes: [
      "The bulletin states the size in cm and KB, not in pixels.",
    ],
    source: {
      title: "CTET Information Bulletin (CBSE)",
      url: "https://cdnbbsr.s3waas.gov.in/s3443dec3062d0286986e21dc0631734c9/uploads/2026/05/202605111250310617.pdf",
      publisher: "Central Board of Secondary Education (CBSE), CTET Unit",
      section: "Registration procedure, (c) Online uploading of scanned images",
      lastVerified: "2026-11-14",
    },
  },
];

// ---------------------------------------------------------------- UPESSC
// Uttar Pradesh Education Services Selection Commission (not UPSSSC). Every UPESSC exam is applied for
// through the myOTR portal (apply.upessc.org, linked from upessc.up.gov.in). The photo, signature and
// hand-written declaration are uploaded once in the OTR profile; exam applications only add certificate PDFs.

const UPESSC_SETS: RequirementSet[] = [
  {
    id: "upessc-otr-2026",
    name: "One Time Registration (myOTR), used for every UPESSC exam",
    photo: { kind: "photo", format: "JPG or PNG", minKB: 10, maxKB: 100, rules: ["Passport-size photograph"] },
    signature: { kind: "signature", format: "JPG or PNG", minKB: 10, maxKB: 100, rules: ["Upload your signature as an image"] },
    declaration: {
      kind: "declaration",
      format: "JPG or PNG",
      minKB: 10,
      maxKB: 100,
      rules: ["Write by hand the declaration the portal displays, then upload a photo or scan of it"],
    },
    notes: [
      "The manual gives no pixel size for any of the three images, only the format and file size.",
      "Creating the account also captures a live photograph with your camera (or a phone, through the “Live QR” option); the portal checks it for liveness and uses it as your photograph, including on the admit card. Keep the camera at eye level, use a plain, well-lit background, look straight at the camera, no cap, mask or dark glasses, face and both ears visible.",
      "Other OTR documents (photo ID proof, 10th, 12th, graduation and post-graduation marksheets) are PDFs of 20–200 KB.",
      "Exam applications reuse the OTR photo, signature and marksheets. The TGT (07/2026), Principal (08/2026) and Headmaster (09/2026) forms ask only for extra certificates, each a PDF of 20–200 KB (TGT advertisement para 2.14).",
    ],
    source: {
      title: "User Manual: myOTR Candidate Portal (English)",
      url: "https://apply.upessc.org/docs/OTR_User_Manual_English.pdf",
      publisher: "Uttar Pradesh Education Services Selection Commission (UPESSC)",
      section: "Section 2, Step-5 (live photograph) and section 4.6, Step-5: Documents",
      lastVerified: "2026-10-25",
    },
  },
];

// ---------------------------------------------------------------- Applications

export const APPLICATIONS = {
  ssc: { name: "SSC", fullName: "Staff Selection Commission", sets: SSC_SETS },
  upsc: {
    name: "UPSC",
    fullName: "Union Public Service Commission",
    sets: [],
    unverified: {
      reason:
        "UPSC's current photo instructions are published inside its online application portal. The publicly available UPSC documents we checked give different pixel limits from each other, so we couldn't confirm which values apply to the current application form.",
      whereToCheck: [
        { label: "UPSC online application portal (Instructions and FAQs > Photos and Signature)", url: "https://upsconline.nic.in/" },
        { label: "UPSC website: examination notices", url: "https://upsc.gov.in/" },
      ],
      checkedOn: "2026-10-07",
    },
  },
  ibps: { name: "IBPS", fullName: "Institute of Banking Personnel Selection", sets: IBPS_SETS },
  sbi: { name: "SBI", fullName: "State Bank of India", sets: SBI_SETS },
  neet: { name: "NEET", fullName: "National Eligibility cum Entrance Test (UG), conducted by NTA", sets: NEET_SETS },
  jee: { name: "JEE Main", fullName: "Joint Entrance Examination (Main), conducted by NTA", sets: JEE_SETS },
  rrb: { name: "RRB", fullName: "Railway Recruitment Boards (Indian Railways)", sets: RRB_SETS },
  rrc: { name: "RRC Central Railway", fullName: "Railway Recruitment Cell, Central Railway", sets: RRC_SETS },
  indianBank: { name: "Indian Bank", fullName: "Indian Bank (public sector bank)", sets: INDIAN_BANK_SETS },
  kea: { name: "KEA", fullName: "Karnataka Examinations Authority", sets: KEA_SETS },
  afcat: { name: "AFCAT", fullName: "Air Force Common Admission Test (Indian Air Force)", sets: AFCAT_SETS },
  cuet: { name: "CUET", fullName: "Common University Entrance Test (UG), conducted by NTA", sets: CUET_SETS },
  upPolice: { name: "UP Police", fullName: "Uttar Pradesh Police Recruitment and Promotion Board (UPPRPB)", sets: UP_POLICE_SETS },
  uksssc: { name: "UKSSSC", fullName: "Uttarakhand Subordinate Service Selection Commission", sets: UKSSSC_SETS },
  gujaratPolice: { name: "Gujarat Police", fullName: "Gujarat Police Recruitment Board (GPRB), applications on OJAS", sets: GUJARAT_POLICE_SETS },
  gds: { name: "India Post GDS", fullName: "Gramin Dak Sevak online engagement, Department of Posts", sets: GDS_SETS },
  mhtCet: { name: "MHT CET", fullName: "MHT CET, conducted by the State CET Cell, Maharashtra", sets: MHT_CET_SETS },
  kcet: { name: "KCET", fullName: "Karnataka Common Entrance Test (UGCET), conducted by KEA", sets: KCET_SETS },
  ctet: { name: "CTET", fullName: "Central Teacher Eligibility Test, conducted by CBSE", sets: CTET_SETS },
  sarathi: { name: "Driving licence", fullName: "Parivahan Sarathi (driving and learner's licence)", sets: SARATHI_SETS },
  eci: { name: "Voter ID", fullName: "Election Commission of India (voter ID / EPIC)", sets: ECI_SETS },
  indiaVisa: { name: "Indian visa", fullName: "Indian visa online application, Government of India", sets: INDIA_VISA_SETS },
  pan: { name: "PAN card", fullName: "PAN (Permanent Account Number), Income Tax Department", sets: PAN_SETS },
  upsssc: { name: "UPSSSC", fullName: "Uttar Pradesh Subordinate Services Selection Commission", sets: UPSSSC_SETS },
  dsssb: { name: "DSSSB", fullName: "Delhi Subordinate Services Selection Board", sets: DSSSB_SETS },
  upessc: { name: "UPESSC", fullName: "Uttar Pradesh Education Services Selection Commission", sets: UPESSC_SETS },
} satisfies Record<string, ApplicationRequirements>;

export type ApplicationId = keyof typeof APPLICATIONS;
