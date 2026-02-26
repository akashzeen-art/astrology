"""
Test script to verify palm analysis is generating real-time, dynamic data.

This script helps verify that:
1. Different images produce different results
2. Calculations are based on actual image features
3. Percentages are unique and not repeated
"""

import json
import os
import sys
from pathlib import Path

# Setup Django environment
import django
from django.conf import settings

# Add backend to path
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

# Configure Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'palmastro_backend.settings')
django.setup()

# Now import Django-dependent modules
from readings.tasks import _run_gpt_palm_model


def test_realtime_analysis(image_path: str):
    """
    Test if palm analysis generates unique, real-time data.
    
    Args:
        image_path: Path to palm image file
    
    Returns:
        dict: Analysis results with verification metrics
    """
    if not os.path.exists(image_path):
        print(f"❌ Error: Image file not found: {image_path}")
        return None
    
    print(f"\n🔍 Testing real-time analysis for: {image_path}")
    print("=" * 60)
    
    try:
        result = _run_gpt_palm_model(image_path)
        
        # Verification checks
        verification = {
            "has_data": bool(result),
            "overall_score": result.get("overallScore", 0),
            "line_scores": {},
            "trait_scores": {},
            "prediction_confidences": {},
            "is_unique": True,
            "has_calculations": False,
            "warnings": []
        }
        
        # Check line scores
        lines = result.get("lines", {})
        for line_name, line_data in lines.items():
            score = line_data.get("score", 0)
            verification["line_scores"][line_name] = score
            details = line_data.get("details", "")
            if "calculated" in details.lower() or "clarity=" in details.lower():
                verification["has_calculations"] = True
        
        # Check trait scores and calculations
        traits = result.get("personality", {}).get("traits", [])
        trait_scores = []
        for trait in traits:
            score = trait.get("score", 0)
            trait_scores.append(score)
            verification["trait_scores"][trait.get("name", "Unknown")] = score
            description = trait.get("description", "")
            if "calculated" in description.lower() or "=" in description:
                verification["has_calculations"] = True
        
        # Check for repeated scores (non-unique data indicator)
        all_scores = list(verification["line_scores"].values()) + trait_scores
        unique_scores = set(all_scores)
        if len(unique_scores) < len(all_scores) * 0.5:  # More than 50% duplicates
            verification["is_unique"] = False
            verification["warnings"].append("Many repeated scores detected - may not be real-time")
        
        # Check for "round" numbers (50, 60, 70, 80, 90, 100) - indicator of static data
        round_numbers = [50, 60, 70, 80, 90, 100]
        round_count = sum(1 for score in all_scores if score in round_numbers)
        if round_count > len(all_scores) * 0.3:  # More than 30% are round numbers
            verification["warnings"].append(f"Many round numbers detected ({round_count}/{len(all_scores)}) - may indicate static data")
        
        # Check prediction confidences
        predictions = result.get("predictions", [])
        for pred in predictions:
            area = pred.get("area", "Unknown")
            confidence = pred.get("confidence", 0)
            verification["prediction_confidences"][area] = confidence
        
        # Print results
        print("\n✅ Analysis Results:")
        print(f"  Overall Score: {verification['overall_score']}%")
        print(f"\n  Line Scores:")
        for line, score in verification["line_scores"].items():
            print(f"    - {line}: {score}%")
        print(f"\n  Personality Traits:")
        for trait, score in verification["trait_scores"].items():
            print(f"    - {trait}: {score}%")
        print(f"\n  Prediction Confidences:")
        for area, conf in verification["prediction_confidences"].items():
            print(f"    - {area}: {conf}%")
        
        # Print verification
        print(f"\n🔍 Verification:")
        print(f"  ✓ Has Data: {verification['has_data']}")
        print(f"  ✓ Has Calculation Details: {verification['has_calculations']}")
        print(f"  ✓ Scores Are Unique: {verification['is_unique']}")
        print(f"  ✓ Unique Score Count: {len(unique_scores)}/{len(all_scores)}")
        
        if verification["warnings"]:
            print(f"\n⚠️  Warnings:")
            for warning in verification["warnings"]:
                print(f"    - {warning}")
        else:
            print(f"\n✅ No warnings - Analysis appears to be real-time and dynamic!")
        
        return {
            "result": result,
            "verification": verification
        }
        
    except Exception as e:
        print(f"\n❌ Error during analysis: {str(e)}")
        import traceback
        traceback.print_exc()
        return None


def compare_analyses(image_paths: list):
    """
    Compare multiple palm analyses to verify uniqueness.
    
    Args:
        image_paths: List of paths to different palm images
    """
    print("\n" + "=" * 60)
    print("🔬 COMPARING MULTIPLE ANALYSES FOR UNIQUENESS")
    print("=" * 60)
    
    results = []
    for img_path in image_paths:
        if os.path.exists(img_path):
            result = test_realtime_analysis(img_path)
            if result:
                results.append(result)
        else:
            print(f"⚠️  Skipping {img_path} - file not found")
    
    if len(results) < 2:
        print("\n⚠️  Need at least 2 images to compare uniqueness")
        return
    
    # Compare scores across different images
    print("\n" + "=" * 60)
    print("📊 UNIQUENESS COMPARISON")
    print("=" * 60)
    
    all_overall_scores = [r["verification"]["overall_score"] for r in results]
    unique_overall = len(set(all_overall_scores))
    
    print(f"\nOverall Scores: {all_overall_scores}")
    print(f"Unique Overall Scores: {unique_overall}/{len(all_overall_scores)}")
    
    if unique_overall == len(all_overall_scores):
        print("✅ All overall scores are unique - Good sign of real-time analysis!")
    else:
        print("⚠️  Some overall scores are repeated - May indicate static data")
    
    # Compare line scores
    print(f"\nLine Score Comparison:")
    line_names = ["lifeLine", "heartLine", "headLine", "fateLine"]
    for line_name in line_names:
        scores = []
        for r in results:
            score = r["verification"]["line_scores"].get(line_name, 0)
            scores.append(score)
        unique_count = len(set(scores))
        print(f"  {line_name}: {scores} (Unique: {unique_count}/{len(scores)})")
    
    # Compare trait scores
    print(f"\nTrait Score Comparison:")
    trait_names = ["Creative", "Analytical", "Emotional", "Leadership", "Practical", "Intuitive"]
    for trait_name in trait_names:
        scores = []
        for r in results:
            score = r["verification"]["trait_scores"].get(trait_name, 0)
            scores.append(score)
        unique_count = len(set(scores))
        print(f"  {trait_name}: {scores} (Unique: {unique_count}/{len(scores)})")


if __name__ == "__main__":
    # Example usage
    if len(sys.argv) < 2:
        print("Usage: python test_realtime_analysis.py <image_path> [image_path2] ...")
        print("\nExample:")
        print("  python test_realtime_analysis.py test_palm1.jpg")
        print("  python test_realtime_analysis.py test_palm1.jpg test_palm2.jpg test_palm3.jpg")
        sys.exit(1)
    
    image_paths = sys.argv[1:]
    
    if len(image_paths) == 1:
        # Single image test
        test_realtime_analysis(image_paths[0])
    else:
        # Multiple images comparison
        compare_analyses(image_paths)

