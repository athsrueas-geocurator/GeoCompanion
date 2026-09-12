import datetime as dt
import importlib.util
from pathlib import Path
import sqlite3
import unittest

spec = importlib.util.spec_from_file_location('budget', Path(__file__).with_name('neighbor-budget.py'))
budget = importlib.util.module_from_spec(spec)
spec.loader.exec_module(budget)

class BudgetTests(unittest.TestCase):
    def test_restart_and_backwards_clock_cannot_reset(self):
        db = sqlite3.connect(':memory:')
        date = dt.datetime(2026, 9, 12)
        self.assertEqual(budget.reserve(db, date), 1_600_000)
        self.assertEqual(budget.reserve(db, date), 0)
        self.assertEqual(budget.reserve(db, date-dt.timedelta(days=1)), 0)

    def test_month_limit_and_next_month(self):
        db = sqlite3.connect(':memory:')
        total = sum(budget.reserve(db, dt.datetime(2026, 10, day)) for day in range(1,32))
        self.assertLessEqual(total, 50_000_000)
        self.assertEqual(budget.reserve(db, dt.datetime(2026,11,1)), 1_600_000)

    def test_remaining_allowance(self):
        db = sqlite3.connect(':memory:')
        budget.reserve(db, dt.datetime(2026,9,1))
        db.execute('UPDATE grants SET bytes=49950000')
        db.commit()
        self.assertEqual(budget.reserve(db, dt.datetime(2026,9,2)), 50000)

unittest.main()
