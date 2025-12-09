# Актуальный Script ID из /Users/aleksandr/Desktop/MyGoogleScripts/EcosystemLib/.clasp.json
# EcosystemLib - единая библиотека для всех проектов (SK, MT, SS)
ECOSYSTEM_SCRIPT_ID = "1aiqGU-JwBTNLVXz_XtMVYX6jkP_PzPuft351QYNAz4wcWDVWJUdmmQ0L"

PROJECT_SCRIPT_IDS = {
    # SkinClinic - использует EcosystemLib
    "sk": ECOSYSTEM_SCRIPT_ID,
    # Montibello - использует EcosystemLib
    "mt": ECOSYSTEM_SCRIPT_ID,
    # Soskin - использует EcosystemLib
    "ss": ECOSYSTEM_SCRIPT_ID,
}

# Sensible defaults if the project id isn't mapped explicitly
DEFAULT_SCRIPT_ID = ECOSYSTEM_SCRIPT_ID
