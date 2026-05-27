def check_remediation(scores: dict, thresholds: dict) -> list[dict]:
    """
    Compare each score against role thresholds.
    Returns list of flagged practice modules.
    """
    flags = []

    if scores["knowledge"] < thresholds.get("knowledge", 5):
        flags.append({
            "module_name": "Structure Practice",
            "reason": f"Knowledge score {scores['knowledge']} below threshold {thresholds['knowledge']}"
        })

    if scores["pacing"] < thresholds.get("pacing", 5):
        flags.append({
            "module_name": "Pacing Practice",
            "reason": f"Pacing score {scores['pacing']} below threshold {thresholds['pacing']}"
        })

    if scores["filler_word_usage"] < 5:
        flags.append({
            "module_name": "Filler Word Reduction",
            "reason": f"Filler score {scores['filler_word_usage']} is low — too many filler words"
        })

    return flags
