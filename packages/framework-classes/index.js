/**
 * @license MITNFA
 * @version 0.1.0
 * @file Main Entry point for the Entity Value Aggregate Server Framework Classes package by Twyr
 * @author {@link mailto:vish.desai@auramwellness.com|Vish Desai}
 * @name index.js
 * @copyright &copy; {@link https://auramwellness.com|Twyr} 2025
 */

/**
 * Exporting the base class for the server
 * @ignore
 */
export { EVASBaseClass } from './lib/evas-base-class.js';

/**
 * Exporting the base classes used to create the server artifacts
 * @ignore
 */
export { EVASBaseArtifact } from './lib/base_classes/evas-base-artifact.js';

export { EVASBaseDomain } from './lib/base_classes/evas-base-domain.js';
export { EVASBaseIngressSurface } from './lib/base_classes/evas-base-ingress-surface.js';
export { EVASBaseRepository } from './lib/base_classes/evas-base-repository.js';
export { EVASBaseBoundedContext } from './lib/base_classes/evas-base-bounded-context.js';
export { EVASBaseMiddleware } from './lib/base_classes/evas-base-middleware.js';
export { EVASBaseSurface } from './lib/base_classes/evas-base-surface.js';

/**
 * Exporting the factories
 * @ignore
 */
export { EVASBaseFactory } from './lib/factories/evas-base-factory.js';

/**
 * Exporting the lifecycle managers for each type of artifact
 * @ignore
 */
export { DomainLifecycleManagerFactory } from './lib/lifecycle_managers/domain-lifecycle-manager.js';
export { BoundedContextLifecycleManagerFactory } from './lib/lifecycle_managers/bounded-context-lifecycle-manager.js';
export { ServerLifecycleManagerFactory } from './lib/lifecycle_managers/server-lifecycle-manager.js';
