#!/bin/bash
# Script to start the Django backend server

cd "$(dirname "$0")"
source venv/bin/activate
python manage.py runserver
