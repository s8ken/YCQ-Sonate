#!/bin/bash

# Run Jest unit tests
echo "Running unit tests..."
cd ../..
npm test -- --testMatch="**/src/components/trust/TrustBadge.test.js" --testMatch="**/src/components/conversation/MessageWithCI.test.js" --testMatch="**/src/components/onboarding/TrustOnboarding.test.js" --testMatch="**/src/pages/ConversationDetail.test.js"

# Check if unit tests passed
if [ $? -eq 0 ]; then
  echo "✅ Unit tests passed"
else
  echo "❌ Unit tests failed"
  exit 1
fi

# Open iframe test page in browser
echo "Opening iframe test page in browser..."
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  open "http://localhost:3000/src/tests/iframe-test.html"
  open "http://localhost:3000/src/tests/open-html-files.html"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  # Linux
  xdg-open "http://localhost:3000/src/tests/iframe-test.html"
  xdg-open "http://localhost:3000/src/tests/open-html-files.html"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
  # Windows
  start "http://localhost:3000/src/tests/iframe-test.html"
  start "http://localhost:3000/src/tests/open-html-files.html"
else
  echo "Please open these URLs in your browser:"
  echo "http://localhost:3000/src/tests/iframe-test.html"
  echo "http://localhost:3000/src/tests/open-html-files.html"
fi

# Option to directly test HTML files
echo ""
echo "To directly test HTML files without the React app, run:"
echo "./test-html-files.sh"


echo "Manual verification required for iframe tests."
echo "Please check that all HTML placeholders render correctly in the browser."
