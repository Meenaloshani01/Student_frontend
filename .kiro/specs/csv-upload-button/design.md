# Design Document: CSV Upload Button

## Overview

This feature adds CSV file upload functionality to the StudentDetail page, enabling educators to upload student data files for backend processing and RandomForest classifier training. The implementation integrates a file upload button into the existing StudentDetail page UI, handles file selection through the browser's native file input, and communicates with the backend POST /upload_csv endpoint using multipart/form-data.

The design follows React best practices for file handling, leverages the existing axios-based API service pattern, and uses the ToastContext for user feedback. The upload button will be positioned in the student-actions section alongside existing "Analyze Risk" and "Generate Quiz" buttons, maintaining visual consistency with the current design system.

Key technical considerations include:
- File type validation (CSV only) at the browser level
- Multipart form data encoding for file transmission
- Loading state management during upload
- Comprehensive error handling for network, timeout, and server errors
- Accessibility compliance with keyboard navigation and ARIA labels

## Architecture

### Component Structure

```
StudentDetail (page component)
├── Existing UI elements
├── student-actions section
│   ├── Analyze Risk button
│   ├── Generate Quiz button (conditional)
│   └── CSV Upload button (NEW)
│       └── Hidden file input element
└── Toast notifications (via ToastContext)
```

### Data Flow

1. **User Interaction**: User clicks "Upload CSV" button
2. **File Selection**: Hidden file input triggers browser file picker (filtered to .csv)
3. **File Validation**: Browser validates file extension
4. **Upload Initiation**: Selected file triggers upload handler
5. **API Request**: FormData with file sent to POST /upload_csv via axios
6. **Response Handling**: 
   - Success: Toast notification with success message
   - Error: Toast notification with error details
7. **State Reset**: Button returns to default state

### Integration Points

- **API Service** (`src/services/api.js`): New `uploadCSV` function using axios with multipart/form-data
- **ToastContext** (`src/contexts/ToastContext.jsx`): Existing toast system for success/error feedback
- **StudentDetail Page** (`src/pages/StudentDetail.jsx`): Host component for upload button
- **Backend API**: POST /upload_csv endpoint (existing)

## Components and Interfaces

### New API Function

```javascript
// src/services/api.js
export async function uploadCSV(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  const { data } = await api.post('/upload_csv', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 30000,
  });
  
  return data;
}
```

### StudentDetail Component Modifications

**New State Variables:**
- `uploadingCSV` (boolean): Tracks upload in-progress state
- `fileInputRef` (ref): Reference to hidden file input element

**New Handler Functions:**
- `handleUploadClick()`: Triggers file input click
- `handleFileChange(event)`: Processes selected file and initiates upload
- `performUpload(file)`: Executes API call and handles response

**New UI Elements:**
- Upload button in student-actions section
- Hidden file input with accept=".csv" attribute

### Component Interface

```javascript
// Upload button props (internal state)
{
  onClick: handleUploadClick,
  disabled: uploadingCSV,
  className: "btn btn-secondary",
  type: "button"
}

// File input props
{
  ref: fileInputRef,
  type: "file",
  accept: ".csv",
  onChange: handleFileChange,
  style: { display: 'none' }
}
```

## Data Models

### File Upload Request

**Format**: multipart/form-data

**Structure**:
```
POST /upload_csv
Content-Type: multipart/form-data

file: [Binary CSV file data]
```

### API Response Models

**Success Response**:
```javascript
{
  message: string,  // e.g., "CSV uploaded successfully"
  // Additional fields may be returned by backend
}
```

**Error Response**:
```javascript
{
  detail: string,  // Error message from backend
  // or
  message: string  // Alternative error message field
}
```

### Frontend State Model

```javascript
{
  uploadingCSV: boolean,      // Upload in progress
  fileInputRef: React.RefObject<HTMLInputElement>
}
```

## Error Handling

### Error Categories

1. **File Selection Errors**
   - User cancels file selection: No action, silent handling
   - Invalid file type: Browser prevents selection (accept attribute)

2. **Network Errors**
   - Network unavailable: Catch axios error, display "Network error. Please check your connection."
   - Request timeout (>30s): Display "Upload timed out. Please try again."

3. **Server Errors**
   - 4xx errors: Display error message from response.data.detail or response.data.message
   - 5xx errors: Display "Server error. Please try again later."
   - Malformed response: Display "Unexpected error occurred."

4. **Client Errors**
   - Empty file: Backend validation, display server error message
   - Invalid CSV format: Backend validation, display server error message
   - File too large: Backend validation, display server error message

### Error Handling Implementation

```javascript
try {
  const response = await uploadCSV(file);
  addToast(response.message || 'CSV uploaded successfully', 'success');
} catch (error) {
  let errorMessage = 'Failed to upload CSV';
  
  if (error.code === 'ECONNABORTED') {
    errorMessage = 'Upload timed out. Please try again.';
  } else if (error.response) {
    errorMessage = error.response.data?.detail 
      || error.response.data?.message 
      || `Server error: ${error.response.status}`;
  } else if (error.request) {
    errorMessage = 'Network error. Please check your connection.';
  }
  
  addToast(errorMessage, 'error');
} finally {
  setUploadingCSV(false);
}
```

### State Recovery

- All errors reset `uploadingCSV` to false in finally block
- Button returns to enabled state after error
- File input value is cleared after each upload attempt
- Toast notifications auto-dismiss after 4 seconds (existing behavior)


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: File selection triggers upload handler

*For any* CSV file selection event, the upload handler function should be invoked with the selected file.

**Validates: Requirements 1.4**

### Property 2: Upload request format

*For any* CSV file upload, the request should be sent as a POST to /upload_csv with the file included in multipart/form-data format.

**Validates: Requirements 2.1, 2.2**

### Property 3: Button disabled during upload

*For any* upload in progress, the upload button should be disabled to prevent multiple simultaneous uploads.

**Validates: Requirements 2.4, 5.5**

### Property 4: Success handling

*For any* successful backend response, the system should display a success toast notification and return the button to its enabled state.

**Validates: Requirements 3.1, 3.3**

### Property 5: Error message display

*For any* error response from the backend, the system should display an error toast with the appropriate error message and return the button to its enabled state.

**Validates: Requirements 4.1, 4.4**

### Property 6: File input click delegation

*For any* upload button click event, the hidden file input element's click method should be triggered.

**Validates: Requirements 1.2**

## Testing Strategy

### Testing Approach

This feature will use a dual testing approach combining unit tests and property-based tests to ensure comprehensive coverage:

**Unit Tests** will verify:
- Specific UI element rendering (button visibility, positioning, styling)
- File input configuration (accept attribute, hidden state)
- Specific error scenarios (timeout, network errors)
- Accessibility attributes (ARIA labels, button type)
- Integration with ToastContext

**Property-Based Tests** will verify:
- Universal behaviors across all file selections
- Request format consistency for any file upload
- State management during any upload operation
- Error handling for any error response
- Button state transitions for any upload lifecycle

### Property-Based Testing Configuration

**Library**: We will use `@fast-check/vitest` for property-based testing in this React/Vitest project.

**Configuration**:
- Minimum 100 iterations per property test
- Each test will reference its design document property using the tag format:
  - `// Feature: csv-upload-button, Property 1: File selection triggers upload handler`

**Test Organization**:
```
src/pages/__tests__/
├── StudentDetail.test.jsx          # Unit tests
└── StudentDetail.properties.test.jsx  # Property-based tests
```

### Unit Test Coverage

1. **Rendering Tests**
   - Upload button is visible on the page
   - Upload button is positioned in student-actions section
   - Upload button has correct styling classes (btn btn-secondary)
   - File input has accept=".csv" attribute
   - File input is hidden (display: none)

2. **Accessibility Tests**
   - Upload button is a button element with type="button"
   - Upload button has descriptive text or aria-label
   - Upload button is keyboard accessible

3. **Specific Error Scenarios**
   - Timeout error displays correct message
   - Network error displays correct message
   - Success toast uses 'success' type
   - Error toast uses 'error' type

4. **Integration Tests**
   - Toast context integration works correctly
   - API service is called with correct parameters
   - Timeout configuration is set to 30000ms

### Property-Based Test Coverage

1. **Property 1: File selection triggers upload handler**
   - Generate: Various file objects with different names and sizes
   - Test: Handler is called for each file selection
   - Tag: `Feature: csv-upload-button, Property 1`

2. **Property 2: Upload request format**
   - Generate: Various CSV file objects
   - Test: POST request to /upload_csv with FormData containing file
   - Tag: `Feature: csv-upload-button, Property 2`

3. **Property 3: Button disabled during upload**
   - Generate: Various file uploads
   - Test: Button disabled attribute is true during upload
   - Tag: `Feature: csv-upload-button, Property 3`

4. **Property 4: Success handling**
   - Generate: Various success response payloads
   - Test: Success toast called and button re-enabled
   - Tag: `Feature: csv-upload-button, Property 4`

5. **Property 5: Error message display**
   - Generate: Various error responses (different status codes, messages)
   - Test: Error toast called with appropriate message and button re-enabled
   - Tag: `Feature: csv-upload-button, Property 5`

6. **Property 6: File input click delegation**
   - Generate: Various button click events
   - Test: File input click method is called
   - Tag: `Feature: csv-upload-button, Property 6`

### Test Execution

- Unit tests: Run with `npm test` or `vitest`
- Property tests: Run with same command, minimum 100 iterations per property
- Both test suites should pass before feature is considered complete
- Property tests provide comprehensive input coverage
- Unit tests provide specific edge case and integration validation

### Mocking Strategy

- Mock axios API calls using vitest mocking
- Mock ToastContext for isolated component testing
- Mock file input interactions using Testing Library utilities
- Mock FormData for request format validation
- Use fake timers for timeout testing
