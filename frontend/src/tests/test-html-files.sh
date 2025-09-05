#!/bin/bash

# Function to open a file in the default browser
open_file() {
  local file_path=$1
  
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open "$file_path"
  elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    xdg-open "$file_path"
  elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows
    start "$file_path"
  else
    echo "Please open $file_path in your browser"
  fi
}

# Get the absolute path to the project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# Open each HTML file
echo "Opening trust-intro.html..."
open_file "$PROJECT_ROOT/public/images/onboarding/trust-intro.html"

echo "Opening trust-badges.html..."
open_file "$PROJECT_ROOT/public/images/onboarding/trust-badges.html"

echo "Opening trust-details.html..."
open_file "$PROJECT_ROOT/public/images/onboarding/trust-details.html"

echo "Manual verification required for HTML files."
echo "Please check that all HTML files render correctly in the browser."
