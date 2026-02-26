from __future__ import annotations

from datetime import date

from django.test import TestCase

from numerology.utils import (
  compute_karmic_lessons,
  compute_numerology,
  numerology_from_birthdate,
  numerology_from_name,
  reduce_number,
)


class NumerologyUtilsTests(TestCase):
  def test_reduce_number_preserves_master_numbers(self):
    self.assertEqual(reduce_number(11), 11)
    self.assertEqual(reduce_number(22), 22)
    self.assertEqual(reduce_number(33), 33)

  def test_reduce_number_basic(self):
    self.assertEqual(reduce_number(29), 11)  # 2+9=11 (master)
    self.assertEqual(reduce_number(38), 11)  # 3+8=11
    self.assertEqual(reduce_number(19), 1)   # 1+9=10 -> 1+0=1

  def test_numerology_from_birthdate(self):
    d = date(1990, 1, 5)  # 1+9+9+0+0+1+0+5 = 25 -> 7
    data = numerology_from_birthdate(d)
    self.assertEqual(data["life_path_raw"], 25)
    self.assertEqual(data["life_path"], 7)

  def test_numerology_from_name_basic(self):
    data = numerology_from_name("John Doe")
    self.assertIn("destiny", data)
    self.assertIn("soul", data)
    self.assertIn("personality", data)
    self.assertTrue(len(data["normalized_name"]) > 0)

  def test_karmic_lessons_subset(self):
    lessons = compute_karmic_lessons("John Doe")
    self.assertTrue(all(1 <= n <= 9 for n in lessons))

  def test_compute_numerology_structure(self):
    d = date(1990, 1, 5)
    result = compute_numerology("John Doe", d)
    self.assertIn("life_path", result)
    self.assertIn("destiny", result)
    self.assertIn("soul", result)
    self.assertIn("personality", result)
    self.assertIn("karmic_lessons", result)


