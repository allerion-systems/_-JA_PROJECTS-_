"""Project constants for Texas Roadhouse — Clarksville, IN.

Every value here is taken from the approved roofing submittal binder
(Submittal #2.05 Rev 0, dated 2026-06-16, spec sections 07 53 00 / 07 55 00 /
07 62 00 / 07 72 00) unless flagged otherwise. Values that are NOT established
by the submittal are marked FIELD_VERIFY and must be confirmed before the
drawing is released for fabrication.
"""

# --- identification --------------------------------------------------------
PROJECT = "TEXAS ROADHOUSE — CLARKSVILLE"
ADDRESS = "4615 Medical Plaza Way, Clarksville, IN 47129"
GC = "Buffalo Construction, Inc."
GC_JOB = "26-TR-009"
GC_PM = "Kathryn Bell"
GC_SUPT = "Zach Fields"
SUBCONTRACTOR = "R&B ROOFING & REMODELING"
SUB_ADDR = "Louisville, KY"
SUBCONTRACT = "S26TR009-14"
ARCHITECT = "SEE CONTRACT DOCS"      # not named in the submittal packet
SUPPLIER = "QXO — Louisville, KY"

SUBMITTAL_PARENT = "#2.05 R0 (07 72 00)"

# --- the roof the vent sits in --------------------------------------------
PANEL_MFR = "Metal Sales Manufacturing Corp."
PANEL_PROFILE = "5V-Crimp"
PANEL_GAUGE = "26 ga"
PANEL_MATERIAL = "Galvalume (AZ50/AZ55), acrylic-coated, unpainted"
PANEL_COLOR_CODE = "41 — Non-Painted Galvalume"
PANEL_COVERAGE = 24.0        # in., net coverage
PANEL_RIB_HEIGHT = 0.50      # in., per submittal
PANEL_YIELD_KSI = 50
PANEL_WEIGHT_PSF = 0.78
PANEL_MIN_SLOPE = "3:12"
PANEL_ATTACHMENT = "Exposed / direct-fastened through the flat"

PANEL_APPROVALS = [
    "UL 2218 Class 4 impact",
    "UL 790 Class A fire",
    "UL 580 Class 90 uplift (Const. #579 & #453)",
    "Miami-Dade NOA 23-0222.06 (26 ga)",
    "Texas Windstorm RC-160",
    "2023 Florida Building Code",
]

# Roof slope at the vent location. The submittal establishes 3:12 as the
# panel's MINIMUM slope, not the roof's actual slope. Do not fabricate the
# upslope diverter angle from an assumed pitch.
ROOF_SLOPE_FIELD_VERIFY = True
ROOF_SLOPE_DESIGN = "4:12"    # drawing basis — CONFIRM before release

# --- the vent --------------------------------------------------------------
VENT_MFR_OF_RECORD = "Dan's Custom Sheet Metal (DCSM)"
VENT_DESCRIPTION = "DCSM Metal Roof Vent — Galvalume, 5V profile"
VENT_SPEC_SECTION = "07 72 00"

# Vent shell material. Matching the panel's substrate and finish is what keeps
# the assembly from staining or setting up a galvanic cell at the fasteners.
VENT_GAUGE = "24 ga"          # heavier than the 26 ga panel for hood rigidity
VENT_MATERIAL = "24ga galv"   # resolves through sheetmetal.thickness()
VENT_FINISH = "Acrylic-coated Galvalume to match Metal Sales code 41"

# --- fasteners and sealants -----------------------------------------------
FASTENER_PANEL = ('#10-14 x 1" hex washer head woodgrip screw, '
                  'Class 4 coated, bonded EPDM washer')
FASTENER_STITCH = '#12-14 x 7/8" stitch screw w/ bonded EPDM washer'
SEALANT_LAP = "Non-hardening butyl tape sealant, 3/8\" x 1/8\""
SEALANT_TOOLED = "Single-component polyurethane, gun grade"
SCREEN = '1/4" mesh aluminum insect screen'

# --- drawing control -------------------------------------------------------
DRAWN_BY = "J. ALLEE"
CHECKED_BY = ""
STATUS = "FOR GC / ARCHITECT APPROVAL"
