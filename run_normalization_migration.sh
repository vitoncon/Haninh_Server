#!/bin/bash

# Script to run the study results normalization migration
# This script will migrate the study_results table to the new normalized structure

echo "Starting Study Results Normalization Migration..."

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "Error: Please run this script from the Haninh_Server directory"
    exit 1
fi

# Check if knex is available
if ! command -v npx &> /dev/null; then
    echo "Error: npx is not available. Please install Node.js and npm."
    exit 1
fi

echo "Step 1: Creating backup of current database..."
# Note: You should implement your own backup strategy here
echo "⚠️  WARNING: Please ensure you have a backup of your database before proceeding!"
echo "Press Enter to continue or Ctrl+C to abort..."
read

echo "Step 2: Running migrations..."

# Run the migrations in order
echo "Creating exams table..."
npx knex migrate:up 20250122000000_create_exams_table.js

echo "Creating exam_skills table..."
npx knex migrate:up 20250122000001_create_exam_skills_table.js

echo "Creating exam_results table..."
npx knex migrate:up 20250122000002_create_exam_results_table.js

echo "Migrating existing data..."
npx knex migrate:up 20250122000003_migrate_study_results_data.js

echo "Creating stored procedures and triggers..."
npx knex migrate:up 20250122000005_create_exam_statistics_procedures.js

echo "Step 3: Verifying migration..."

# Run verification queries
echo "Checking new tables..."
npx knex raw "SELECT table_name FROM information_schema.tables WHERE table_name IN ('exams', 'exam_skills', 'exam_results');"

echo "Checking data counts..."
npx knex raw "SELECT 'exams' as table_name, COUNT(*) as count FROM exams UNION ALL SELECT 'exam_skills', COUNT(*) FROM exam_skills UNION ALL SELECT 'exam_results', COUNT(*) FROM exam_results;"

echo "Step 4: Testing new functionality..."
echo "Testing stored procedure..."
npx knex raw "SELECT * FROM get_student_exam_results_by_skills(1, NULL, NULL) LIMIT 5;"

echo ""
echo "✅ Migration completed successfully!"
echo ""
echo "Next steps:"
echo "1. Update your backend API to use the new endpoints"
echo "2. Update your frontend components to use the new service methods"
echo "3. Test the new 4-skill display format"
echo "4. Consider dropping the old study_results table after verification"
echo ""
echo "To drop the old table, run:"
echo "npx knex migrate:up 20250122000004_drop_old_study_results_table.js"
echo ""
echo "Migration completed at: $(date)"




