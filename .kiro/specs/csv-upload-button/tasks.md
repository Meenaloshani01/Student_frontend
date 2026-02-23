# Implementation Plan: CSV Upload Button

## Overview

This implementation adds CSV file upload functionality to the StudentDetail page using React. The approach follows the existing patterns in the codebase: adding a new API service function, integrating a file upload button into the student-actions section, and using the ToastContext for user feedback. Implementation will be incremental, starting with the API layer, then the UI components, and finally the error handling and accessibility features.

## Tasks

- [x] 1. Add CSV upload API function
  - [x] 1.1 Create uploadCSV function in src/services/api.js
    - Implement function that accepts a file parameter
    - Create FormData and append file with key 'file'
    - Make POST request to '/upload_csv' with multipart/form-data headers
    - Set timeout to 30000ms (30 seconds)
    - Return response data
    - _Requirements: 2.1, 2.2, 2.3_

- [x] 2. Add upload button UI to StudentDetail page
  - [x] 2.1 Add state management for upload functionality
    - Add uploadingCSV state variable (boolean, default false)
    - Create fileInputRef using useRef hook
    - _Requirements: 2.4, 5.5_
  
  - [x] 2.2 Implement file upload handler functions
    - Create handleUploadClick function to trigger file input click
    - Create handleFileChange function to process selected file
    - Create performUpload async function to call uploadCSV API and handle response
    - _Requirements: 1.4, 2.1_
  
  - [x] 2.3 Add upload button and hidden file input to JSX
    - Add button element in student-actions section with "Upload CSV" text
    - Add hidden file input with accept=".csv" attribute
    - Wire onClick to handleUploadClick
    - Wire file input onChange to handleFileChange
    - Set button disabled state based on uploadingCSV
    - Apply btn btn-secondary classes for styling consistency
    - _Requirements: 1.1, 1.2, 1.3, 5.1, 5.2_

- [ ]* 2.4 Write property test for file selection triggering upload handler
    - **Property 1: File selection triggers upload handler**
    - **Validates: Requirements 1.4**

- [x] 3. Implement success and error handling
  - [x] 3.1 Add success handling in performUpload function
    - Display success toast with message from response or default message
    - Reset uploadingCSV state to false
    - Clear file input value
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [x] 3.2 Add comprehensive error handling in performUpload function
    - Handle timeout errors (ECONNABORTED) with specific message
    - Handle server errors (response exists) by extracting detail or message from response.data
    - Handle network errors (no response) with network error message
    - Display error toast with appropriate message
    - Reset uploadingCSV state to false in finally block
    - Clear file input value
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [ ]* 3.3 Write property test for upload request format
    - **Property 2: Upload request format**
    - **Validates: Requirements 2.1, 2.2**

- [ ]* 3.4 Write property test for button disabled during upload
    - **Property 3: Button disabled during upload**
    - **Validates: Requirements 2.4, 5.5**

- [ ]* 3.5 Write property test for success handling
    - **Property 4: Success handling**
    - **Validates: Requirements 3.1, 3.3**

- [ ]* 3.6 Write property test for error message display
    - **Property 5: Error message display**
    - **Validates: Requirements 4.1, 4.4**

- [x] 4. Add accessibility features
  - [x] 4.1 Add accessibility attributes to upload button
    - Set type="button" attribute
    - Add aria-label or ensure descriptive button text
    - Verify keyboard accessibility (button element is keyboard accessible by default)
    - _Requirements: 5.3, 5.4_

- [ ]* 4.2 Write property test for file input click delegation
    - **Property 6: File input click delegation**
    - **Validates: Requirements 1.2**

- [ ]* 4.3 Write unit tests for upload button component
    - Test button rendering and visibility
    - Test button positioning in student-actions section
    - Test file input accept attribute is ".csv"
    - Test file input is hidden
    - Test button styling classes
    - Test accessibility attributes
    - Test toast integration for success and error cases
    - Test specific error scenarios (timeout, network, server errors)

- [x] 5. Final checkpoint
  - Verify upload button appears in student-actions section
  - Test file selection opens browser file picker
  - Test successful CSV upload shows success toast
  - Test error scenarios show appropriate error messages
  - Verify button is disabled during upload
  - Ensure all tests pass, ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The implementation builds incrementally: API → UI → Error Handling → Accessibility
- Property tests validate universal correctness properties across all inputs
- Unit tests validate specific examples, edge cases, and integration points
- The existing ToastContext and axios API patterns are reused for consistency
