'use strict';

exports.up = async function (knex) {
	let exists;

	// Step 1: Create the basic "artifacts" table
	exists = await knex?.schema
		?.withSchema?.('public')
		?.hasTable?.('artifacts');
	if (!exists) {
		await knex?.schema
			?.withSchema?.('public')
			?.createTable?.('artifacts', (artifactTable) => {
				artifactTable
					?.uuid?.('id')
					?.notNullable?.()
					?.primary?.()
					?.defaultTo?.(knex?.raw?.('gen_random_uuid()'));

				artifactTable
					?.uuid?.('parent_id')
					?.references?.('id')
					?.inTable?.('artifacts')
					?.onDelete?.('CASCADE')
					?.onUpdate?.('CASCADE');

				artifactTable?.text?.('name')?.notNullable?.();
				artifactTable?.text?.('display_name')?.notNullable?.();
				artifactTable?.text?.('description')?.notNullable?.();

				artifactTable
					?.uuid?.('artifact_type_id')
					?.notNullable?.()
					?.references?.('id')
					?.inTable?.('artifact_type_master')
					?.onDelete?.('CASCADE')
					?.onUpdate?.('CASCADE');
				artifactTable
					?.uuid?.('artifact_availability_mode_id')
					?.notNullable?.()
					?.references?.('id')
					?.inTable?.('artifact_availability_mode_master')
					?.onDelete?.('CASCADE')
					?.onUpdate?.('CASCADE');

				artifactTable
					?.jsonb?.('configuration')
					?.notNullable?.()
					?.defaultTo?.('{}');

				artifactTable
					?.jsonb?.('configuration_schema')
					?.notNullable?.()
					?.defaultTo?.('{}');

				artifactTable
					?.jsonb?.('metadata')
					?.notNullable?.()
					?.defaultTo?.('{}');
				artifactTable
					?.boolean?.('enabled')
					?.notNullable?.()
					?.defaultTo?.(true);

				artifactTable
					?.timestamp?.('created_at')
					?.notNullable?.()
					?.defaultTo?.(knex?.fn?.now?.());
				artifactTable
					?.timestamp?.('updated_at')
					?.notNullable?.()
					?.defaultTo?.(knex?.fn?.now?.());

				artifactTable?.unique?.([
					'parent_id',
					'artifact_type_id',
					'name'
				]);
			});
	}

	// Step 2: Setup permissions table - stores details of permissions defined/described by the artifacts
	exists = await knex?.schema
		?.withSchema?.('public')
		?.hasTable?.('artifact_permissions');
	if (!exists) {
		await knex?.schema
			?.withSchema?.('public')
			?.createTable?.(
				'artifact_permissions',
				function (permissionsTable) {
					permissionsTable
						?.uuid?.('id')
						?.notNullable?.()
						?.primary?.()
						?.defaultTo?.(knex?.raw?.('gen_random_uuid()'));
					permissionsTable
						?.uuid?.('artifact_id')
						?.notNullable?.()
						?.references?.('id')
						?.inTable?.('artifacts')
						?.onDelete?.('CASCADE')
						?.onUpdate?.('CASCADE');

					permissionsTable?.text?.('name')?.notNullable?.();
					permissionsTable?.text?.('display_name')?.notNullable?.();
					permissionsTable?.text?.('description')?.notNullable?.();

					permissionsTable
						?.jsonb?.('implies_permissions')
						?.notNullable?.()
						?.defaultTo?.('[]');

					permissionsTable
						?.timestamp?.('created_at')
						?.notNullable?.()
						?.defaultTo?.(knex.fn.now());
					permissionsTable
						?.timestamp?.('updated_at')
						?.notNullable?.()
						?.defaultTo?.(knex.fn.now());

					permissionsTable?.unique?.(['id', 'artifact_id']);
					permissionsTable?.unique?.(['artifact_id', 'name']);
				}
			);
	}

	// Step 3: Tree traversal for artifacts
	await knex?.schema?.withSchema?.('public')?.raw?.(`
CREATE OR REPLACE FUNCTION public.fn_get_artifact_ancestors (IN artifactid uuid)
	RETURNS TABLE (level integer, id uuid, parent_id uuid, name text, artifact_type_id uuid, artifact_availability_mode_id uuid, enabled boolean)
	LANGUAGE plpgsql
	VOLATILE
	CALLED ON NULL INPUT
	SECURITY INVOKER
	COST 1
	AS $$
BEGIN
	RETURN QUERY
	WITH RECURSIVE q AS (
		SELECT
			1 AS level,
			A.id,
			A.parent_id,
			A.name,
			A.artifact_type_id,
			A.artifact_availability_mode_id,
			A.enabled
		FROM
			artifacts A
		WHERE
			A.id = artifactid
		UNION ALL
		SELECT
			q.level + 1,
			B.id,
			B.parent_id,
			B.name,
			B.artifact_type_id,
			B.artifact_availability_mode_id,
			B.enabled
		FROM
			q,
			artifacts B
		WHERE
			B.id = q.parent_id
	)
	SELECT DISTINCT
		q.level,
		q.id,
		q.parent_id,
		q.name,
		q.artifact_type_id,
		q.artifact_availability_mode_id,
		q.enabled
	FROM
		q
	ORDER BY
		q.level;
END;
$$;`);

	await knex?.schema?.withSchema?.('public')?.raw?.(`
CREATE OR REPLACE FUNCTION public.fn_get_artifact_descendants (IN artifactid uuid)
	RETURNS TABLE (level integer, id uuid, parent_id uuid, name text, artifact_type_id uuid, artifact_availability_mode_id uuid, enabled boolean)
	LANGUAGE plpgsql
	VOLATILE
	CALLED ON NULL INPUT
	SECURITY INVOKER
	COST 1
	AS $$
BEGIN
	RETURN QUERY
	WITH RECURSIVE q AS (
		SELECT
			1 AS level,
			A.id,
			A.parent_id,
			A.name,
			A.artifact_type_id,
			A.artifact_availability_mode_id,
			A.enabled
		FROM
			artifacts A
		WHERE
			A.id = artifactid
		UNION ALL
		SELECT
			q.level + 1,
			B.id,
			B.parent_id,
			B.name,
			B.artifact_type_id,
			B.artifact_availability_mode_id,
			B.enabled
		FROM
			q,
			artifacts B
		WHERE
			B.parent_id = q.id
	)
	SELECT DISTINCT
		q.level,
		q.id,
		q.parent_id,
		q.name,
		q.artifact_type_id,
		q.artifact_availability_mode_id,
		q.enabled
	FROM
		q
	ORDER BY
		q.level;
END;
$$;`);

	// Step 4: Module enable status
	await knex?.schema?.withSchema?.('public')?.raw?.(`
CREATE OR REPLACE FUNCTION public.fn_is_artifact_enabled (IN artifactid uuid)
	RETURNS boolean
	LANGUAGE plpgsql
	VOLATILE
	CALLED ON NULL INPUT
	SECURITY INVOKER
	COST 1
	AS $$
DECLARE
	is_disabled	integer;
BEGIN
	is_disabled := 0;

	SELECT
		COUNT(enabled)
	FROM
		fn_get_artifact_ancestors(artifactid)
	WHERE
		enabled = false
	INTO
		is_disabled;

	RETURN is_disabled <= 0;
END;
$$;`);

	// Step 5: Check artifact upserts are valid
	await knex?.schema?.withSchema?.('public')?.raw?.(`
CREATE OR REPLACE FUNCTION public.fn_check_artifact_upsert_is_valid ()
	RETURNS trigger
	LANGUAGE plpgsql
	VOLATILE
	CALLED ON NULL INPUT
	SECURITY INVOKER
	COST 1
	AS $$
DECLARE
	artifact_type	TEXT;
	parent_type	TEXT;
	is_artifact_in_tree	INTEGER;
BEGIN
	/* Rule #1: No obviously infinite loops */
	IF NEW.id = NEW.parent_id
	THEN
		RAISE SQLSTATE '2F003' USING MESSAGE = 'Module cannot be its own parent';
		RETURN NULL;
	END IF;

	/* Rule #2: Update operations need fewer checks... */
	IF TG_OP = 'UPDATE'
	THEN
		/* Rule #2.1: Name is not mutable */
		IF OLD.name <> NEW.name
		THEN
			RAISE SQLSTATE '2F003' USING MESSAGE = 'Module name is NOT mutable';
			RETURN NULL;
		END IF;

		/* Rule #2.2: Type is not mutable */
		IF OLD.artifact_type_id <> NEW.artifact_type_id
		THEN
			RAISE SQLSTATE '2F003' USING MESSAGE = 'Module type is NOT mutable';
			RETURN NULL;
		END IF;

		/* Rule #2.3: Parent is not mutable */
		IF OLD.parent_id <> NEW.parent_id
		THEN
			RAISE SQLSTATE '2F003' USING MESSAGE = 'Module parent is NOT mutable';
			RETURN NULL;
		END IF;

		/* Update Operation: We're good to go! */
		RETURN NEW;
	END IF;

	/* Get the data we need to make further decisions */
	artifact_type := '';
	SELECT
		name
	FROM
		artifact_type_master
	WHERE
		id = (SELECT artifact_type_id FROM artifacts WHERE id = NEW.id)
	INTO
		artifact_type;

	parent_type := '';
	SELECT
		name
	FROM
		artifact_type_master
	WHERE
		id = (SELECT artifact_type_id FROM artifacts WHERE id = NEW.parent_id)
	INTO
		parent_type;

	/* Rule #3: Servers cannot have parents */
	IF artifact_type = 'server' AND NEW.parent_id IS NULL
	THEN
		RETURN NEW;
	END IF;

	/* Rule #4: All Servers MUST NOT have parents */
	IF artifact_type = 'server' AND NEW.parent_id IS NOT NULL
	THEN
		RAISE SQLSTATE '2F003' USING MESSAGE = 'Server Modules cannot have parents' ;
		RETURN NULL;
	END IF;

	/* Rule #5: All non-servers MUST have parents */
	IF artifact_type <> 'server' AND NEW.parent_id IS NULL
	THEN
		RAISE SQLSTATE '2F003' USING MESSAGE = 'Only Server Modules cannot have parents - all other artifact types must belong to a Server' ;
		RETURN NULL;
	END IF;


	/* Rule #6: Modules cannot host other artifact types as parents - unless they are either Servers, Domains, or Modules */

	/* Rule #6.1: Servers can host only Domains, Modules, and Repositories */
	IF parent_type = 'server'
	THEN
		IF artifact_type <> 'domain' AND artifact_type <> 'feature' AND artifact_type <> 'repository'
		THEN
			RAISE SQLSTATE '2F003' USING MESSAGE = 'Servers can host only Domains, Modules, and Repositories' ;
			RETURN NULL;
		END IF;
	END IF;

	/* Rule #6.2: Domains can host only Domains, Modules, and Repositories */
	IF parent_type = 'domain'
	THEN
		IF artifact_type <> 'domain' AND artifact_type <> 'feature' AND artifact_type <> 'repository'
		THEN
			RAISE SQLSTATE '2F003' USING MESSAGE = 'Domains can host only Domains, Modules, and Repositories' ;
			RETURN NULL;
		END IF;
	END IF;

	/* Rule #6.3: Modules can host only Modules, Surfaces and Middlewares */
	IF parent_type = 'feature'
	THEN
		IF artifact_type <> 'feature' AND artifact_type <> 'surface' AND artifact_type <> 'middleware'
		THEN
			RAISE SQLSTATE '2F003' USING MESSAGE = 'Modules can host only Modules, Surfaces, and Middlewares' ;
			RETURN NULL;
		END IF;
	END IF;

	/* Rule #6.4: Other artifact types can host only their own types */
	IF parent_type = 'repository' OR parent_type = 'surface' OR parent_type = 'middleware'
	THEN
		IF artifact_type <> parent_type
		THEN
			RAISE SQLSTATE '2F003' USING MESSAGE = 'Surfaces, Middlewares, and Repositories can host other artifacts of the same type' ;
			RETURN NULL;
		END IF;
	END IF;

	/* Rule #7: No non-obvious infinite loops, either */
	is_artifact_in_tree := 0;
	SELECT
		COUNT(id)
	FROM
		fn_get_artifact_ancestors(NEW.parent_id)
	WHERE
		id = NEW.id
	INTO
		is_artifact_in_tree;

	IF is_artifact_in_tree > 0
	THEN
		RAISE SQLSTATE '2F003' USING MESSAGE = 'Module cannot be its own ancestor';
		RETURN NULL;
	END IF;

	is_artifact_in_tree := 0;
	SELECT
		COUNT(id)
	FROM
		fn_get_artifact_descendants(NEW.id)
	WHERE
		id = NEW.id AND
		level > 1
	INTO
		is_artifact_in_tree;

	IF is_artifact_in_tree > 0
	THEN
		RAISE SQLSTATE '2F003' USING MESSAGE = 'Module cannot be its own descendant';
		RETURN NULL;
	END IF;

	/* We're good to go! */
	RETURN NEW;
END;
$$;`);

	// Step 6: Check artifact permission upserts are valid
	await knex?.schema?.withSchema?.('public')?.raw?.(`
CREATE OR REPLACE FUNCTION public.fn_check_permission_upsert_is_valid ()
	RETURNS trigger
	LANGUAGE plpgsql
	VOLATILE
	CALLED ON NULL INPUT
	SECURITY INVOKER
	COST 1
	AS $$
DECLARE
	is_server_or_domain	INTEGER;
BEGIN
	IF TG_OP = 'UPDATE'
	THEN
		IF OLD.artifact_id <> NEW.artifact_id
		THEN
			RAISE SQLSTATE '2F003' USING MESSAGE = 'Module assigned to a permission is NOT mutable';
			RETURN NULL;
		END IF;

		IF OLD.name <> NEW.name
		THEN
			RAISE SQLSTATE '2F003' USING MESSAGE = 'Permission name is NOT mutable';
			RETURN NULL;
		END IF;
	END IF;

	is_server_or_domain := 0;
	SELECT
		COUNT(id)
	FROM
		artifacts
	WHERE
		id = NEW.artifact_id AND
		artifact_type_id IN (SELECT id FROM artifact_type_master WHERE name = 'domain' OR name = 'server')
	INTO
		is_server_or_domain;

	IF is_server_or_domain <= 0
	THEN
		RAISE SQLSTATE '2F003' USING MESSAGE = 'Only Servers and Domains can define permissions';
		RETURN NULL;
	END IF;

	RETURN NEW;
END;
$$;`);

	// Step 7: Update outside world of goings-on using notifications.
	await knex?.schema?.withSchema?.('public')?.raw?.(`
CREATE OR REPLACE FUNCTION public.fn_notify_artifact_change ()
	RETURNS trigger
	LANGUAGE plpgsql
	VOLATILE
	CALLED ON NULL INPUT
	SECURITY INVOKER
	COST 1
	AS $$
DECLARE
	server_name TEXT;
BEGIN
	server_name := '';

	IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE'
	THEN
		SELECT
			name
		FROM
			fn_get_artifact_ancestors(NEW.id)
		WHERE
			parent_id IS NULL
		INTO
			server_name;
	END IF;

	IF TG_OP = 'DELETE'
	THEN
		SELECT
			name
		FROM
			fn_get_artifact_ancestors(OLD.id)
		WHERE
			parent_id IS NULL
		INTO
			server_name;
	END IF;

	IF TG_OP = 'INSERT'
	THEN
		IF NEW.name = server_name
		THEN
			PERFORM pg_notify(CONCAT(server_name, '!Added'), CAST(NEW.id AS text));
		END IF;

		IF NEW.name <> server_name
		THEN
			PERFORM pg_notify(CONCAT(server_name, '!Module!Added'), CAST(NEW.id AS text));
		END IF;

		RETURN NEW;
	END IF;

	IF TG_OP = 'UPDATE'
	THEN
		IF NEW.name = server_name
		THEN
			PERFORM pg_notify(CONCAT(server_name, '!Updated'), CAST(NEW.id AS text));
		END IF;

		IF NEW.name <> server_name
		THEN
			PERFORM pg_notify(CONCAT(server_name, '!Module!Updated'), CAST(NEW.id AS text));
		END IF;

		IF OLD.configuration <> NEW.configuration
		THEN
			PERFORM pg_notify(CONCAT(server_name, '!Config!Changed'), CAST(NEW.id AS text));
		END IF;

		IF OLD.enabled <> NEW.enabled
		THEN
			PERFORM pg_notify(CONCAT(server_name, '!State!Changed'), CAST(NEW.id AS text));
		END IF;

		RETURN NEW;
	END IF;

	IF TG_OP = 'DELETE'
	THEN
		IF OLD.name = server_name
		THEN
			PERFORM pg_notify(CONCAT(server_name, '!Deleted'), CAST(OLD.id AS text));
		END IF;

		IF OLD.name <> server_name
		THEN
			PERFORM pg_notify(CONCAT(server_name, '!Module!Deleted'), CAST(OLD.id AS text));
		END IF;

		RETURN OLD;
	END IF;
END;
$$;`);

	// Finally, create the triggers...
	await knex?.schema
		?.withSchema?.('public')
		?.raw?.(
			'CREATE TRIGGER trigger_check_artifact_upsert_is_valid BEFORE INSERT OR UPDATE ON public.artifacts FOR EACH ROW EXECUTE PROCEDURE public.fn_check_artifact_upsert_is_valid();'
		);
	await knex?.schema
		?.withSchema?.('public')
		?.raw?.(
			'CREATE TRIGGER trigger_check_permission_upsert_is_valid BEFORE INSERT OR UPDATE ON public.artifact_permissions FOR EACH ROW EXECUTE PROCEDURE public.fn_check_permission_upsert_is_valid();'
		);
	await knex?.schema
		?.withSchema?.('public')
		?.raw?.(
			'CREATE TRIGGER trigger_notify_artifact_change AFTER UPDATE ON public.artifacts FOR EACH ROW EXECUTE PROCEDURE public.fn_notify_artifact_change();'
		);
};

exports.down = async function (knex) {
	await knex?.raw?.(
		`DROP TRIGGER IF EXISTS trigger_notify_artifact_change ON public.artifacts CASCADE;`
	);
	await knex?.raw?.(
		`DROP TRIGGER IF EXISTS trigger_check_permission_upsert_is_valid ON public.artifact_permissions CASCADE;`
	);
	await knex?.raw?.(
		`DROP TRIGGER IF EXISTS trigger_check_artifact_upsert_is_valid ON public.artifacts CASCADE;`
	);

	await knex?.raw?.(
		`DROP FUNCTION IF EXISTS public.fn_notify_artifact_change () CASCADE;`
	);
	await knex?.raw?.(
		`DROP FUNCTION IF EXISTS public.fn_check_permission_upsert_is_valid () CASCADE;`
	);
	await knex?.raw?.(
		`DROP FUNCTION IF EXISTS public.fn_check_artifact_upsert_is_valid () CASCADE;`
	);

	await knex?.raw?.(
		`DROP FUNCTION IF EXISTS public.fn_is_artifact_enabled (IN uuid) CASCADE;`
	);
	await knex?.raw?.(
		`DROP FUNCTION IF EXISTS public.fn_get_artifact_descendants (IN uuid) CASCADE;`
	);
	await knex?.raw?.(
		`DROP FUNCTION IF EXISTS public.fn_get_artifact_ancestors (IN uuid) CASCADE;`
	);

	await knex?.raw?.(
		`DROP TABLE IF EXISTS public.artifact_permissions CASCADE;`
	);
	await knex?.raw?.(`DROP TABLE IF EXISTS public.artifacts CASCADE;`);
};
