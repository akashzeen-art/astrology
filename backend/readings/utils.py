"""
Utility functions for reading operations.
"""

from typing import Optional
from django.contrib.auth import get_user_model
from .models import Reading, ReadingStatus, ReadingType

User = get_user_model()


def get_user_latest_palm_reading(user: User) -> Optional[Reading]:
    """
    Get the user's most recent completed palm reading.
    Used for integrating palm data into numerology/astrology readings.
    
    Args:
        user: The authenticated user
        
    Returns:
        The latest palm reading or None if no palm reading exists
    """
    return Reading.objects.filter(
        user=user,
        reading_type=ReadingType.PALM_ANALYSIS,
        status=ReadingStatus.DONE
    ).order_by("-created_at").first()


def extract_palm_insights_for_integration(palm_reading: Reading) -> dict:
    """
    Extract key insights from a palm reading to be used in other readings.
    
    Args:
        palm_reading: A completed palm reading
        
    Returns:
        Dictionary with extracted insights
    """
    if not palm_reading or not palm_reading.result:
        return {}
    
    result = palm_reading.result
    insights = {
        "palm_reading_id": str(palm_reading.id),
        "palm_reading_date": palm_reading.created_at.isoformat(),
    }
    
    # Extract overall score
    if isinstance(result, dict):
        overall_score = result.get("overallScore") or result.get("overall_score")
        if overall_score:
            insights["overall_score"] = overall_score
        
        # Extract personality traits
        personality = result.get("personality") or result.get("personality_traits", {})
        if isinstance(personality, dict):
            traits = personality.get("traits", [])
            if isinstance(traits, list):
                insights["personality_traits"] = {
                    trait.get("name", ""): trait.get("score", 0)
                    for trait in traits
                    if isinstance(trait, dict)
                }
        
        # Extract palm lines summary
        lines = result.get("lines") or result.get("palm_lines", {})
        if isinstance(lines, dict):
            insights["palm_lines_summary"] = {
                line_name: {
                    "quality": line_data.get("quality") or line_data.get("type", ""),
                    "score": line_data.get("score") or line_data.get("quality_score", 0),
                }
                for line_name, line_data in lines.items()
                if isinstance(line_data, dict)
            }
    
    return insights

