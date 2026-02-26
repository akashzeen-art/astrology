from __future__ import annotations

from datetime import date

from django.test import TestCase

from astrology.utils import approximate_sun_sign, compute_basic_chart


class AstrologyUtilsTests(TestCase):
    def test_approximate_sun_sign_basic(self):
        self.assertEqual(approximate_sun_sign(date(1990, 4, 10)), "Aries")
        self.assertEqual(approximate_sun_sign(date(1990, 8, 10)), "Leo")

    def test_compute_basic_chart_structure(self):
        chart = compute_basic_chart(date(1990, 4, 10), None, "Delhi, India")
        self.assertIn(chart.sun_sign, ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
                                       "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"])
        self.assertIsInstance(chart.metadata, dict)


