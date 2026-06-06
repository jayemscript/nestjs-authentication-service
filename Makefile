generate_migration:
	npx ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js migration:generate -d src/database/data-source.ts src/migrations/$(name)

empty_migration:
	npx ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js migration:create src/migrations/$(name)

run_migration:
	npx ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js migration:run -d src/database/data-source.ts

show_migration:
	npx ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js migration:show -d src/database/data-source.ts

revert_migration:
	npx ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js migration:revert -d src/database/data-source.ts