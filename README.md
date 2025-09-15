[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/XpMBPV7Q)
Demo #3
# HTML Basic Elements

## Overview
This demo will teach you the fundamental HTML elements and how to use them to create structured web content. You'll learn about text elements, lists, tables, and images - the building blocks of web pages.

## What You'll Create
A comprehensive HTML page featuring:
- Proper HTML document structure
- Text formatting elements (headings, paragraphs, emphasis)
- Ordered and unordered lists
- Basic tables with rows and columns
- Images with proper attributes
- Nested elements and complex structures

## Prerequisites
- Any modern web browser (Chrome, Firefox, Safari, Edge)
- A text editor (VS Code, Sublime Text, Notepad++, or even Notepad)
- Basic understanding of HTML structure (from Demo #2)

## Instructions

## Step 1: Complete the HTML Document Structure

1. Open the file `index.html` in your text editor
2. You'll see a basic HTML structure that needs to be completed:
   ```html
   <!doctype html>
   <html lang="en">
   <head>
     <meta charset="UTF-8">
     <title>HTML Basic Elements Demo</title>
   </head>
   <body>
     <!-- Your content will go here -->
   </body>
   </html>
   ```

## Step 2: Add Text Elements

1. Inside the `<body>` tag, add the following text elements:
   ```html
   <h1>SWE 363</h1>
   <h2>Introduction to HTML</h2>
   <p>A course where we will learn the basics of HTML, CSS & JS.</p>
   ```

2. Experiment with different text formatting:
   ```html
   <p>This is a <strong>bold</strong> text and this is <em>italic</em> text.</p>
   <p>You can also use <mark>highlighted</mark> text for emphasis.</p>
   ```

## Step 3: Create Lists

1. Add an unordered list:
   ```html
   <h3>Course Topics:</h3>
   <ul>
     <li>HTML Basics</li>
     <li>CSS Styling</li>
     <li>JavaScript Programming</li>
     <li>Web Development Tools</li>
   </ul>
   ```

3. Create a nested list:
   ```html
   <h3>Web Technologies:</h3>
   <ul>
     <li>Frontend
       <ul>
         <li>HTML</li>
         <li>CSS</li>
         <li>JavaScript</li>
       </ul>
     </li>
     <li>Backend
       <ul>
         <li>Node.js</li>
         <li>Databases</li>
         <li>APIs</li>
       </ul>
     </li>
   </ul>
   ```

## Step 4: Build Tables

1. Create a table with headers:
   ```html
   <h3>Student Grades:</h3>
   <table border="1">
     <thead>
       <tr>
         <th>Student Name</th>
         <th>Assignment 1</th>
         <th>Assignment 2</th>
         <th>Final Grade</th>
       </tr>
     </thead>
     <tbody>
       <tr>
         <td>Ahmed</td>
         <td>85</td>
         <td>90</td>
         <td>A</td>
       </tr>
       <tr>
         <td>Fatima</td>
         <td>92</td>
         <td>88</td>
         <td>A</td>
       </tr>
     </tbody>
   </table>
   ```

## Step 5: Add Images

1. Add the KFUPM logo to your page:
   ```html
   <h3>KFUPM Logo:</h3>
   <img src="img/kfupm.svg" alt="KFUPM Logo" width="200" height="200">
   ```

## Step 6: View Your Page

1. Save the `index.html` file
2. Open your web browser
3. Drag and drop the `index.html` file into your browser window
   
   OR
   
   Right-click the `index.html` file and select "Open with" → Choose your browser
   
   OR
   
   Double-click the `index.html` file (if your browser is set as the default)

4. You should see your complete HTML page with all the elements!

## What You're Creating

Your HTML page demonstrates:

### Text Elements:
- **Headings**: `<h1>` to `<h6>` for different heading levels
- **Paragraphs**: `<p>` for text content
- **Formatting**: `<strong>`, `<em>`, `<mark>` for text emphasis

### Lists:
- **Unordered Lists**: `<ul>` with `<li>` items for bullet points
- **Nested Lists**: Lists within lists for complex structures

### Tables:
- **Basic Structure**: `<table>`, `<tr>` (rows), `<td>` (cells)
- **Table Headers**: `<thead>`, `<th>` for column headers
- **Table Body**: `<tbody>` for main content

### Images:
- **Image Element**: `<img>` for displaying pictures
- **Attributes**: `src` (source), `alt` (alternative text), `width`, `height`

## Understanding HTML Elements

1. **Opening and Closing Tags**: Most elements have `<tag>` and `</tag>`
2. **Void Elements**: Some elements like `<img>` don't need closing tags
3. **Attributes**: Elements can have attributes like `src="..."` or `alt="..."`
4. **Nesting**: Elements can contain other elements (proper nesting required)

## Customization Ideas

Try these modifications to experiment:
- Change the course title and description
- Add more items to your lists
- Create a table with your own data
- Replace placeholder images with real images
- Add more formatting to your text
- Create a personal profile page

## Troubleshooting

- **Page not loading**: Make sure the file is saved with `.html` extension
- **Elements not displaying**: Check that all tags are properly closed
- **Table looks wrong**: Ensure proper `<tr>` and `<td>` structure
- **Images not showing**: Check the image URL or file path
- **Lists not formatting**: Verify proper `<ul>`, `<ol>`, and `<li>` tags

## Project Structure

Your project looks like this:
```
demo_3_html_basics/
├── index.html       # Your HTML file with all elements
└── README.md        # This instruction file
```

## Next Steps

Once you've completed this HTML elements demo, you can:
- Learn about CSS to style your HTML elements
- Explore more advanced HTML elements (forms, semantic elements)
- Create multiple pages and link them together
- Learn about responsive design principles
- Practice with real-world web development projects

## HTML Resources

- **MDN Web Docs**: https://developer.mozilla.org/en-US/docs/Web/HTML
- **W3Schools HTML Tutorial**: https://www.w3schools.com/html/default.asp
- **HTML Element Reference**: https://developer.mozilla.org/en-US/docs/Web/HTML/Element

Congratulations! You've mastered the basic HTML elements! 🎉
