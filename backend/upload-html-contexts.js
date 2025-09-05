const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { JSDOM } = require('jsdom');
require('dotenv').config();

// Import the Context model
const Context = require('./models/context.model');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/symbi';

// Function to extract text content from HTML
function extractTextFromHTML(htmlContent) {
  try {
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;
    
    // Remove script and style elements
    const scripts = document.querySelectorAll('script, style');
    scripts.forEach(script => script.remove());
    
    // Get text content and clean it up
    let textContent = document.body ? document.body.textContent : document.textContent;
    
    // Clean up whitespace and normalize
    textContent = textContent
      .replace(/\s+/g, ' ')  // Replace multiple whitespace with single space
      .replace(/\n\s*\n/g, '\n')  // Remove empty lines
      .trim();
    
    return textContent;
  } catch (error) {
    console.error('Error extracting text from HTML:', error);
    return '';
  }
}

// Function to create context entry from HTML file
function createContextFromHTML(filePath, textContent) {
  const fileName = path.basename(filePath, '.html');
  
  // Extract meaningful title from filename
  let title = fileName
    .replace(/ - Claude.*$/i, '')  // Remove Claude timestamp suffix
    .replace(/\(.*\)$/g, '')     // Remove parenthetical content
    .trim();
  
  // If title is too short, use first 50 characters of content
  if (title.length < 10 && textContent.length > 0) {
    title = textContent.substring(0, 50).trim() + '...';
  }
  
  // Create primary tag based on filename and content
  let primaryTag = 'conversation';  // default tag
  if (fileName.toLowerCase().includes('ai')) primaryTag = 'ai';
  if (fileName.toLowerCase().includes('collaboration')) primaryTag = 'collaboration';
  if (fileName.toLowerCase().includes('ethics')) primaryTag = 'ethics';
  if (fileName.toLowerCase().includes('research')) primaryTag = 'research';
  if (fileName.toLowerCase().includes('symbi')) primaryTag = 'symbi';
  if (fileName.toLowerCase().includes('governance')) primaryTag = 'governance';
  if (fileName.toLowerCase().includes('consciousness')) primaryTag = 'consciousness';
  
  return {
    tag: primaryTag,
    source: 'system',  // Use 'system' as it's a valid enum value
    data: {
      title: title,
      content: textContent,
      originalFile: fileName,
      contentType: 'html_archive'
    },
    metadata: {
      originalFile: fileName,
      uploadedAt: new Date(),
      contentLength: textContent.length,
      extractedFrom: 'html'
    },
    isActive: true
  };
}

// Main function to upload HTML contexts
async function uploadHTMLContexts() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');
    
    // Define the HTML files to process
    const archivesDir = path.join(__dirname, '..', 'archives');
    const selectedFiles = [
      'AI Ethics Research Case Study - Claude (8_29_2025 12：54：38 PM).html',
      'Creative AI Collaboration Exploration - Claude.html',
      'SYMBI AI Interaction Analysis - Claude (8_29_2025 12：54：56 PM).html'
    ];
    
    console.log(`Processing ${selectedFiles.length} HTML files...`);
    
    const uploadedContexts = [];
    
    for (const fileName of selectedFiles) {
      const filePath = path.join(archivesDir, fileName);
      
      console.log(`\nProcessing: ${fileName}`);
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${fileName}`);
        continue;
      }
      
      // Read HTML content
      const htmlContent = fs.readFileSync(filePath, 'utf8');
      console.log(`Read ${htmlContent.length} characters from file`);
      
      // Extract text content
      const textContent = extractTextFromHTML(htmlContent);
      console.log(`Extracted ${textContent.length} characters of text`);
      
      // Skip if no meaningful content extracted
      if (textContent.length < 100) {
        console.log('Skipping file - insufficient text content');
        continue;
      }
      
      // Create context object
      const contextData = createContextFromHTML(filePath, textContent);
      console.log(`Created context: "${contextData.data.title}"`);
      console.log(`Tag: ${contextData.tag}`);
      
      // Check if context with similar title already exists
      const existingContext = await Context.findOne({ 
        'data.title': { $regex: contextData.data.title.substring(0, 20), $options: 'i' } 
      });
      
      if (existingContext) {
        console.log('Similar context already exists, skipping...');
        continue;
      }
      
      // Save to database
      const newContext = new Context(contextData);
      const savedContext = await newContext.save();
      
      uploadedContexts.push(savedContext);
      console.log(`✓ Uploaded context with ID: ${savedContext._id}`);
    }
    
    console.log(`\n=== Upload Summary ===`);
    console.log(`Successfully uploaded ${uploadedContexts.length} contexts`);
    
    if (uploadedContexts.length > 0) {
      console.log('\nUploaded contexts:');
      uploadedContexts.forEach((context, index) => {
        console.log(`${index + 1}. ${context.data.title} (${context.data.content.length} chars)`);
        console.log(`   Tag: ${context.tag}`);
        console.log(`   ID: ${context._id}`);
      });
    }
    
  } catch (error) {
    console.error('Error uploading HTML contexts:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('\nMongoDB connection closed');
  }
}

// Run the upload script
if (require.main === module) {
  uploadHTMLContexts();
}

module.exports = { uploadHTMLContexts, extractTextFromHTML, createContextFromHTML };