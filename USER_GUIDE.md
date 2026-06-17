# Student Advisor AI - User Guide

## 🚀 Getting Started

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

## 📤 Uploading Student Data

### CSV Format Required
Your CSV must include a `pass` column with binary values (0 or 1):

```csv
student_id,attendance,internal_marks,assignment_marks,previous_gpa,midterm_score,quiz_average,participation,study_hours,absences,pass
1,92,85,88,3.8,82,87,90,25,2,1
2,45,35,40,2.1,38,42,35,8,15,0
```

### Upload Steps
1. Navigate to **Upload Data** page
2. Click **"📥 Download Sample CSV"** to get a template
3. Drag & drop your CSV file or click **"Choose CSV File"**
4. Wait for upload confirmation
5. Navigate to **Students** page to see your data

## 📊 Using the Dashboard

### Overview
- **Summary Cards:** Total students, pass rate, average risk
- **Charts:** Risk distribution and pass probability
- **Quick Stats:** Animated counters
- **Refresh:** Click refresh button to reload data

## 👥 Managing Students

### Students Page
- **View All:** See complete student list with all data columns
- **Search:** Type student ID or topic to filter
- **Sort:** Click column headers to sort
- **Details:** Click any row to view student detail page

### Student Detail Page
- **Metrics:** View attendance, marks, GPA, pass probability
- **Weak Topics:** See struggling subjects
- **Topic Scores:** Radar chart visualization
- **Actions:**
  - **Analyze Risk:** Get AI analysis of risk factors
  - **Generate Quiz:** Create practice quiz (high-risk students)
  - **Upload CSV:** Add more data
  - **Generate DP Plan:** Create optimized study schedule

### At-Risk Students
- Filtered view showing only HIGH risk students
- Quick identification of students needing immediate help

## 🎯 Interventions

### Card Layout
Each student card shows:
- **Header:** Student ID, risk level, pass probability
- **Weak Subjects:** Top struggling topics (up to 3 displayed)
- **Actions:**
  - **Generate Quiz:** Create practice questions
  - **Start Revision:** Get AI revision plan (opens modal)
  - **View Details:** Go to student detail page

### AI Study Plan
- Click "▶ Show" to expand
- See personalized recommendations:
  - Attendance improvement goals
  - Assignment support plans
  - Subject-specific guidance

### DP Optimized Plan
- Click "▶ Show" to expand
- View algorithmically optimized study schedule:
  - **Coverage:** % of weak topics addressed
  - **Hours:** Total study time allocated
  - **Impact:** Predicted improvement score
  - **Subjects:** Prioritized topic list with hours
- Click **"View Full Plan →"** for complete breakdown

### Revision Plan Modal
- Shows detailed revision strategy
- Organized with headers and bullet points
- **Download:** Click "📥 Download Plan" to save as text file
- **Close:** Click X or outside modal to dismiss

## 📈 Predictions

### View ML Predictions
- **Summary Cards:** Total predictions, pass/fail counts
- **Distribution Charts:** Visual representation of probabilities
- **Filters:**
  - Risk level (All/High/Medium/Low)
  - Sort by probability or student ID
- **Search:** Find specific students

## 📄 Reports

### Available Reports
1. **Department-wise Pass Rate:** Bar chart showing performance by department
2. **Risk Distribution:** Pie chart of risk levels
3. **Subject Difficulty:** Bar chart of challenging subjects

### Export Data
- Click **"Export CSV"** to download report data
- Data includes all visible metrics

## 🤖 AI Advisor

### Ask Questions
- Type questions in the input box
- Click **Send** or press Enter
- Use quick action buttons for common queries:
  - "Students needing intervention"
  - "Class overview"
  - "Topic analysis"

### Response Features
- **Formatted Text:** Clean, organized responses
- **Copy:** Click "Copy" to copy response text
- **Download:** Click "📥 PDF" for revision plans
- **History:** Recent queries saved automatically

### Clear Chat
- Click **"Clear chat"** button to reset conversation

## 🔍 Key Features

### Dynamic Column Detection
- System automatically displays all columns from your CSV
- Filters out metadata (attendance, marks, IDs)
- Shows only relevant subject data in radar charts

### Smart Filtering
- Weak topics automatically cleaned (removes invalid values)
- Metadata excluded from subject analysis
- Multiple field name formats supported

### Responsive Design
- Works on desktop, tablet, and mobile
- Touch-friendly interface
- Adaptive layouts

## 🎨 Understanding Risk Levels

### HIGH Risk (Red)
- Pass probability < 40%
- Immediate intervention required
- Eligible for quiz generation
- Priority for study plans

### MEDIUM Risk (Yellow)
- Pass probability 40-65%
- Monitor closely
- Provide support resources
- Preventive interventions

### LOW Risk (Green)
- Pass probability > 65%
- Performing well
- Continue current strategies

## 💡 Tips & Best Practices

### For Faculty
1. **Upload regularly** - Keep student data current
2. **Review at-risk students weekly** - Early intervention is key
3. **Use AI Advisor** - Get insights on class performance
4. **Generate quizzes** - Help students practice weak topics
5. **Download revision plans** - Share with students

### For Administrators
1. **Check reports** - Monitor department performance
2. **Track trends** - Use charts to identify patterns
3. **Export data** - Download for further analysis
4. **Review predictions** - Plan resource allocation

### Data Quality
- Ensure all required columns in CSV
- Use consistent naming conventions
- Include the `pass` column (use 0 for all if prediction-only)
- Remove empty rows and columns
- Use numeric values for marks (not text)

## 🛠️ Troubleshooting

### CSV Upload Fails
**Issue:** "Could not detect a binary target column"
**Solution:** Add a `pass` column with 0 or 1 values

### No Data Displayed
**Issue:** Tables show "No students loaded"
**Solution:** Click **Refresh** button or re-upload CSV

### Weak Topics Show "Name"
**Issue:** "Name" appears as a weak topic
**Solution:** This is filtered out automatically in frontend. Backend fix pending.

### Charts Not Loading
**Issue:** Radar chart empty or not showing
**Solution:** Ensure CSV has subject score columns (not just metadata)

### Revision Plan Not Generating
**Issue:** Modal opens but shows "No revision plan available"
**Solution:** Ensure student has weak topics identified

## 📞 Support

### Common Issues
- Build errors: Run `npm install` again
- Port conflicts: Change port in `vite.config.js`
- API errors: Check backend is running at `http://52.65.58.208`

### Backend API
- **Base URL:** http://52.65.58.208
- **Timeout:** 30 seconds
- **Dataset ID:** default

## 🎓 Advanced Features

### DP Algorithm Details
The Dynamic Programming study plan optimizer uses a knapsack algorithm to:
1. Calculate difficulty for each weak subject
2. Estimate required study hours
3. Compute potential impact of improvement
4. Optimize time allocation for maximum benefit
5. Generate weekly schedule with daily goals

### Study Plan Metrics
- **Coverage:** Percentage of weak topics included in plan
- **Efficiency:** Optimization quality score
- **Total Hours:** Sum of allocated study time
- **Impact Score:** Predicted improvement from plan

---

**Need Help?** Check the PROJECT_STATUS.md file for technical details.
