# Migration Guide: Normalizing Study Results Database

## Overview
This migration normalizes the `study_results` table into three separate tables for better data organization and performance:

1. **exams** - General exam information
2. **exam_skills** - Skills for each exam
3. **exam_results** - Individual student results

## Migration Files Created

### 1. `20250122000000_create_exams_table.js`
Creates the `exams` table with:
- Basic exam information (name, type, date, class, language)
- Statistics (average score, total students)
- Status tracking (draft, active, completed, cancelled)

### 2. `20250122000001_create_exam_skills_table.js`
Creates the `exam_skills` table with:
- Links to exams
- Skill types (Nghe, Nói, Đọc, Viết, Tổng hợp)
- Max scores and weights for each skill
- Order index for display

### 3. `20250122000002_create_exam_results_table.js`
Creates the `exam_results` table with:
- Links to exam_skills and students
- Individual scores and percentages
- Level assessment
- Comments and feedback
- Pass/fail status

### 4. `20250122000003_migrate_study_results_data.js`
Migrates existing data from `study_results` to the new structure:
- Groups data by exam (name, type, date, class, language)
- Creates exams and exam_skills
- Migrates individual results
- Updates statistics automatically

### 5. `20250122000004_drop_old_study_results_table.js`
Removes the old `study_results` table after successful migration.

### 6. `20250122000005_create_exam_statistics_procedures.js`
Creates stored procedures and triggers for:
- Automatic statistics updates
- Function to get results in 4-skill format
- Real-time average calculations

## How to Run Migrations

### Prerequisites
- Ensure you have a backup of your database
- Stop any running applications that use the study_results table

### Step 1: Run Migrations
```bash
cd Haninh_Server
npm run migrate:latest
```

### Step 2: Verify Migration
Check that the new tables are created and data is migrated:
```sql
-- Check new tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('exams', 'exam_skills', 'exam_results');

-- Check data migration
SELECT COUNT(*) FROM exams;
SELECT COUNT(*) FROM exam_skills;
SELECT COUNT(*) FROM exam_results;

-- Verify data integrity
SELECT 
    e.exam_name,
    COUNT(DISTINCT es.id) as skill_count,
    COUNT(er.id) as result_count
FROM exams e
LEFT JOIN exam_skills es ON e.id = es.exam_id
LEFT JOIN exam_results er ON es.id = er.exam_skill_id
GROUP BY e.id, e.exam_name;
```

### Step 3: Test New Functionality
Use the new stored procedure to get results in 4-skill format:
```sql
-- Get student results by skills
SELECT * FROM get_student_exam_results_by_skills(1, NULL, NULL);
```

## New Database Structure Benefits

### 1. Normalized Design
- Eliminates data redundancy
- Easier to maintain and update
- Better data integrity

### 2. Flexible Skill Management
- Each exam can have different skill combinations
- Easy to add/remove skills per exam
- Weighted scoring support

### 3. Better Performance
- Indexed foreign keys
- Optimized queries for common operations
- Automatic statistics updates

### 4. Enhanced Reporting
- 4-skill format display
- Automatic average calculations
- Better statistics and analytics

## API Changes

### New Endpoints
- `GET /api/exams` - List exams with skills
- `POST /api/exams` - Create new exam
- `GET /api/exams/:id/results` - Get exam results
- `GET /api/exams/results-by-skills` - Get results in 4-skill format
- `POST /api/exams/bulk` - Bulk create exam with results

### Updated Service Methods
The `StudyResultService` now includes:
- `getExamResultsBySkills()` - Get results in 4-skill format
- `createBulkExam()` - Create exam with all results at once
- `getStudentExamSummary()` - Enhanced student summary
- `getClassExamStatistics()` - Enhanced class statistics

## Rollback Instructions

If you need to rollback:

```bash
# Rollback to before the migration
npm run migrate:rollback -- --all

# Or rollback specific migrations
npm run migrate:rollback
```

## Data Validation

After migration, verify:
1. All exams are created correctly
2. Skills are properly linked to exams
3. Student results are preserved
4. Statistics are calculated correctly
5. 4-skill format displays properly

## Support

If you encounter issues:
1. Check the migration logs
2. Verify database constraints
3. Test with a small dataset first
4. Contact the development team for assistance




