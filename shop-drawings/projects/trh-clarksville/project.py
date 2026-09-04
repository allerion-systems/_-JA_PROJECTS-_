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
ARCHITECT = "GreenbergFarrow"        # Somerville NJ; R.J. Warshefski AR11900209
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
ROOF_SLOPE_FIELD_VERIFY = False  # established from S3
ROOF_SLOPE_DESIGN = "2.4:12"  # S3 Rafter "B" — the vent plane

# --- the vent --------------------------------------------------------------
VENT_MFR_OF_RECORD = "Dan's Custom Sheet Metal (DCSM)"
VENT_DESCRIPTION = "DCSM Metal Roof Vent — Galvalume, 5V profile"
VENT_SPEC_SECTION = "07 72 00"

# Vent shell material. Matching the panel's substrate and finish is what keeps
# the assembly from staining or setting up a galvanic cell at the fasteners.
VENT_GAUGE = "24 ga"          # heavier than the 26 ga panel for hood rigidity
VENT_MATERIAL = "24ga galvalume"   # resolves through sheetmetal.thickness()
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


# --- architect's roof plan requirements ------------------------------------
# Verbatim from the roof plan sheet. These override anything absent from the
# submittal binder, which established none of them.
#
#   "DCSM METAL ROOF VENT (COLOR: GALVALUME) - NFA MIN. 105 S.I.
#    AT HIGH, TYP. OF 2"
#   "PROVIDE 6"x18" (THRU METAL ROOF, INSULATION, & PLYWOOD)
#    OPENING BETWEEN RAFTERS EACH VENT LOCATION"
#   "5 RIB V-GROOVE METAL ROOF (WITH SIDELAP SM7108 SEALANT AT EACH PANEL
#    ON ROOF PITCH SLOPES LESS THEN 3:12 ONLY)"
#   "NO DIRECT CONTACT [...] LEAK BARRIER & [...] MEMBRANE - NOT [...], SEE 6/A8"
#
PLAN_NFA_MIN_SQIN = 105.0
PLAN_VENT_QTY = 2
PLAN_VENT_LOCATION = "AT HIGH"
PLAN_DECK_OPENING = '6" x 18", between rafters, thru roof/insulation/plywood'
PLAN_PANEL_CALLOUT = "5 RIB V-GROOVE METAL ROOF"
PLAN_SIDELAP_SEALANT = "SM7108 at each panel where pitch < 3:12"
PLAN_INCOMPATIBILITY = "No direct contact, leak barrier to membrane - see 6/A8"

# The sidelap-sealant note implies roof planes BELOW 3:12 exist. Metal Sales
# publishes 3:12 as the 5V-Crimp MINIMUM slope, so a sub-3:12 plane is a
# manufacturer conflict, not merely a sealant condition. Open item on SM-2.


# --- CONTRACT DOCUMENTS ----------------------------------------------------
# GreenbergFarrow project 20291085, permit set dated 02/12/26.
# Architect of Record: GreenbergFarrow, 92 East Main St Suite 410,
#   Somerville NJ 08876. Sealed by Robert James Warshefski, RA Indiana
#   AR11900209, 02/12/26.
# Structural: Michael E. Haas PE, Indiana PE 10809826, GreenbergFarrow Chicago.
# Code: 2014 Indiana Building Code.
#
# The spec book uses the OLD 1995 five-digit CSI MasterFormat. There is NO
# 07 72 00, no 01 33 00, no 01 25 00. The vent is specified ONLY on the
# drawings; the governing spec section for its fabrication is 07620.
ARCHITECT_FIRM = "GreenbergFarrow"
ARCHITECT_SEAL = "Robert James Warshefski, RA (IN) AR11900209, 02/12/26"
STRUCTURAL_SEAL = "Michael E. Haas, PE (IN) 10809826"
GF_PROJECT_NO = "20291085"
PERMIT_SET_DATE = "02/12/2026"
BUILDING_CODE = "2014 Indiana Building Code"

# --- ROOF GEOMETRY AT THE VENTS (sheet S3, Rafter "B") ---------------------
# The architectural sheets carry NO pitch callouts anywhere. The slopes are on
# the structural roof framing plan: Rafter "A" +/-3.5:12, Rafter "B" +/-2.4:12,
# Rafter "C" +/-6.4 and 6.5:12. Both vents fall in the Rafter "B" run - the
# outdoor waiting roof - corroborated by A2 note 7, which requires SM7108
# sidelap sealant "ON ROOF PITCH SLOPES LESS THAN 3:12 ONLY (SPECIFIC
# REQUIREMENT OVER OUTDOOR WAITING ROOF LOCATION ONLY)".
ROOF_SLOPE_AT_VENTS = 2.4          # rise per 12 - BELOW the panel's 3:12 min
RAFTER_SPACING = 24.0              # in. o.c. in the vent bay (16" o.c. west of Header A)
RAFTER_DIRECTION = "down-slope (E-W), perpendicular to the eave"
RAFTER_CLEAR_BAY = 22.5            # in. clear between 2x members
# So the 18" opening dimension runs ACROSS the rafters and the 6" runs WITH
# the slope. 18" in a 22.5" clear bay leaves ~2-1/4" each side.
OPENING_ACROSS_RAFTERS = 18.0
OPENING_WITH_SLOPE = 6.0

# --- ROOF ASSEMBLY AT THE PENETRATION (A8 note blocks) ---------------------
# 5V panel -> ~4" rigid ISO (min R23.6) -> 3/4" T&G APA plywood.
# The GC subcontract scope words it differently: 3/4" ply by the framer, then
# two layers of ISO, then 7/16" OSB, then GAF ice guard, then panel. Reconcile
# before cutting - the throat depth depends on it.
DECK_BUILDUP = '5V panel / ~4" rigid ISO / 3/4" T&G plywood'
LEAK_BARRIER = "GAF StormGuard over APA rated sheathing"

# --- THE VENT, AS ACTUALLY SPECIFIED ---------------------------------------
# A2 general note 9, the A2 plan callout, A3 finish schedule item 8, and
# detail 3/A10.2 "DETAIL AT VENT" (1"=1'-0").
VENT_CONTACT = "Len Osborne, Dan's Custom Sheet Metal, 239.594.0550, len@dcsm.net"
VENT_SECURED = "OVER METAL ROOF RIBS"          # verbatim, detail 3/A10.2
VENT_CUSTOM_FLASHING = ("PROVIDE CUSTOM METAL FLASHING ON ALL SIDES OF "
                        "OPENING (PROVIDES NFA MIN. OF 108 S.I. AT EACH OPENING)")
# The element I had missed entirely - it is the 5V equivalent of DCSM's rear
# counterflashing, formed from an inverted roof panel:
VENT_REVERSED_COVER = ("PROVIDE REVERSED METAL ROOF COVER AT EACH VENT "
                       "(COLOR: GALVALUME) OVER METAL ROOF FROM VENT TO "
                       "CONTINUE UP TOWARDS TOWER WALL")

# NFA CONFLICT ON THE CONTRACT DOCUMENTS:
#   A2 general note 9 and the plan callout say  105 S.I.
#   detail 3/A10.2 says                          108 S.I.   (= 6 x 18)
# Design to the higher figure and RFI the discrepancy.
NFA_GENERAL_NOTE = 105.0
NFA_DETAIL_3A102 = 108.0
NFA_DESIGN = 108.0

# GAUGE CONFLICT ON THE CONTRACT DOCUMENTS:
#   spec 07550 says  "METAL SALES FIVE RIB V-GROOVE: GALVALUME (22 GAUGE)"
#   the approved submittal and PO 26-10349 say  26 GA
# Metal Sales does not stock 5V in 22 ga, so the spec is probably a typo - but
# it is what the contract literally says, and 01600 forbids substitution
# without prior written approval. Get it covered in writing.
PANEL_GAUGE_SPEC = "22 ga (spec 07550)"
PANEL_GAUGE_SUBMITTED = "26 ga (submittal 2.05, PO 26-10349)"

# --- SUBSTITUTIONS: SECTION 01600, NOT 01 25 00 ----------------------------
# "NO SUBSTITUTIONS FOR THE MATERIALS AND EQUIPMENT SPECIFIED SHALL BE MADE
#  UNLESS WRITTEN APPROVAL HAS BEEN GIVEN... SUBSTITUTIONS WILL BE CONSIDERED
#  ONLY IF OWNER RECEIVES THE ADVANTAGE OF LESSER COST WITH NO INCREASE IN
#  QUALITY, OR EARLIER COMPLETION OR BOTH."
# This is a closed spec. "Earlier completion" is the only door the panel
# lead-time substitution can walk through, and it needs written Owner approval
# BEFORE ordering.
SUBSTITUTION_SECTION = "01600 - MATERIALS AND EQUIPMENT"

# --- FABRICATION SPEC: SECTION 07620 ---------------------------------------
# "ZINC-COATED STEEL: ... ASTM A526, EXCEPT ASTM A527 FOR LOCK-FORMING, G90
#  HOT-DIP GALVANIZED ... 24 GAUGE, EXCEPT AS OTHERWISE INDICATED."
# "...SMACNA ARCHITECTURAL SHEET METAL MANUAL ... FORM EXPOSED SHEET METAL
#  WORK WITHOUT EXCESSIVE OIL-CANNING, BUCKLING, AND TOOL MARKS ... WITH
#  EXPOSED EDGES FOLDED BACK TO FORM HEMS."
# "FABRICATE NON-MOVING SEAMS ... WITH FLAT-LOCK SEAMS ... TIN EDGES TO BE
#  SEAMED, FORM SEAMS AND SOLDER."
#
# MATERIAL CONFLICT: 07620 calls for G90 GALVANIZED and a soldered flat-lock
# seam. The drawings call the vent and the reversed cover GALVALUME. Galvalume
# is ASTM A792 and CANNOT be soldered, and it carries a 2T bend radius limit
# where G90 is 1T. Confirm which material governs - it changes the tooling,
# the seam type and the bend radius.
FAB_SPEC_SECTION = "07620 - SHEET METAL FLASHING AND TRIM"
FAB_SPEC_GAUGE = "24 ga"
FAB_SPEC_MATERIAL = "G90 hot-dip galvanized per 07620 vs Galvalume per drawings"

# --- SUBMITTAL PROCEDURE: SECTION 01300, NOT 01 33 00 ----------------------
SUBMITTAL_SETS = 3                 # minimum to the Architect; 2 returned
SUBMITTAL_STAMP_REQUIRED = True    # unstamped submittals returned unreviewed
SUBMITTAL_NOTE = ("No draw accepted until all shop drawings submitted. "
                  "Contractor approval stamp and signature required.")
