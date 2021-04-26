import { defined } from '../Core/defined';
import { hasExtension } from './hasExtension';

/**
 * Contains traversal functions for processing elements of the glTF hierarchy.
 * @constructor
 *
 * @private
 */
function ForEach() {}

/**
 * Fallback for glTF 1.0
 * @private
 */
ForEach.objectLegacy = function(objects: any, handler: any) {
    if (defined(objects)) {
        for (var objectId in objects) {
            if (Object.prototype.hasOwnProperty.call(objects, objectId)) {
                var object = objects[objectId];
                var value = handler(object, objectId);

                if (defined(value)) {
                    return value;
                }
            }
        }
    }
};

/**
 * @private
 */
ForEach.object = function(arrayOfObjects: any, handler: any) {
    if (defined(arrayOfObjects)) {
        var length = arrayOfObjects.length;
        for (var i = 0; i < length; i++) {
            var object = arrayOfObjects[i];
            var value = handler(object, i);

            if (defined(value)) {
                return value;
            }
        }
    }
};

/**
 * Supports glTF 1.0 and 2.0
 * @private
 */
ForEach.topLevel = function(gltf: any, name: any, handler: any) {
    var gltfProperty = gltf[name];
    if (defined(gltfProperty) && !Array.isArray(gltfProperty)) {
        return ForEach.objectLegacy(gltfProperty, handler);
    }

    return ForEach.object(gltfProperty, handler);
};

ForEach.accessor = function(gltf: any, handler: any) {
    return ForEach.topLevel(gltf, 'accessors', handler);
};

ForEach.accessorWithSemantic = function(gltf: any, semantic: any, handler: any) {
    var visited: any = {};
    return ForEach.mesh(gltf, function(mesh: any) {
        return ForEach.meshPrimitive(mesh, function(primitive: any) {
            var valueForEach = ForEach.meshPrimitiveAttribute(primitive, function(accessorId: any, attributeSemantic: any) {
                if (attributeSemantic.indexOf(semantic) === 0 && !defined(visited[accessorId])) {
                    visited[accessorId] = true;
                    var value = handler(accessorId);

                    if (defined(value)) {
                        return value;
                    }
                }
            });

            if (defined(valueForEach)) {
                return valueForEach;
            }

            return ForEach.meshPrimitiveTarget(primitive, function(target: any) {
                return ForEach.meshPrimitiveTargetAttribute(target, function(accessorId: any, attributeSemantic: any) {
                    if (attributeSemantic.indexOf(semantic) === 0 && !defined(visited[accessorId])) {
                        visited[accessorId] = true;
                        var value = handler(accessorId);

                        if (defined(value)) {
                            return value;
                        }
                    }
                });
            });
        });
    });
};

ForEach.accessorContainingVertexAttributeData = function(gltf: any, handler: any) {
    var visited: any = {};
    return ForEach.mesh(gltf, function(mesh: any) {
        return ForEach.meshPrimitive(mesh, function(primitive: any) {
            var valueForEach = ForEach.meshPrimitiveAttribute(primitive, function(accessorId: any) {
                if (!defined(visited[accessorId])) {
                    visited[accessorId] = true;
                    var value = handler(accessorId);

                    if (defined(value)) {
                        return value;
                    }
                }
            });

            if (defined(valueForEach)) {
                return valueForEach;
            }

            return ForEach.meshPrimitiveTarget(primitive, function(target: any) {
                return ForEach.meshPrimitiveTargetAttribute(target, function(accessorId: any) {
                    if (!defined(visited[accessorId])) {
                        visited[accessorId] = true;
                        var value = handler(accessorId);

                        if (defined(value)) {
                            return value;
                        }
                    }
                });
            });
        });
    });
};

ForEach.accessorContainingIndexData = function(gltf: any, handler: any) {
    var visited: any = {};
    return ForEach.mesh(gltf, function(mesh: any) {
        return ForEach.meshPrimitive(mesh, function(primitive: any) {
            var indices = primitive.indices;
            if (defined(indices) && !defined(visited[indices])) {
                visited[indices] = true;
                var value = handler(indices);

                if (defined(value)) {
                    return value;
                }
            }
        });
    });
};

ForEach.animation = function(gltf: any, handler: any) {
    return ForEach.topLevel(gltf, 'animations', handler);
};

ForEach.animationChannel = function(animation: any, handler: any) {
    var channels = animation.channels;
    return ForEach.object(channels, handler);
};

ForEach.animationSampler = function(animation: any, handler: any) {
    var samplers = animation.samplers;
    return ForEach.object(samplers, handler);
};

ForEach.buffer = function(gltf: any, handler: any) {
    return ForEach.topLevel(gltf, 'buffers', handler);
};

ForEach.bufferView = function(gltf: any, handler: any) {
    return ForEach.topLevel(gltf, 'bufferViews', handler);
};

ForEach.camera = function(gltf: any, handler: any) {
    return ForEach.topLevel(gltf, 'cameras', handler);
};

ForEach.image = function(gltf: any, handler: any) {
    return ForEach.topLevel(gltf, 'images', handler);
};

ForEach.compressedImage = function(image: any, handler: any) {
    if (defined(image.extras)) {
        var compressedImages = image.extras.compressedImage3DTiles;
        for (var type in compressedImages) {
            if (Object.prototype.hasOwnProperty.call(compressedImages, type)) {
                var compressedImage = compressedImages[type];
                var value = handler(compressedImage, type);

                if (defined(value)) {
                    return value;
                }
            }
        }
    }
};

ForEach.material = function(gltf: any, handler: any) {
    return ForEach.topLevel(gltf, 'materials', handler);
};

ForEach.materialValue = function(material: any, handler: any) {
    var values = material.values;
    if (defined(material.extensions) && defined(material.extensions.KHR_techniques_webgl)) {
        values = material.extensions.KHR_techniques_webgl.values;
    }

    for (var name in values) {
        if (Object.prototype.hasOwnProperty.call(values, name)) {
            var value = handler(values[name], name);

            if (defined(value)) {
                return value;
            }
        }
    }
};

ForEach.mesh = function(gltf: any, handler: any) {
    return ForEach.topLevel(gltf, 'meshes', handler);
};

ForEach.meshPrimitive = function(mesh: any, handler: any) {
    var primitives = mesh.primitives;
    if (defined(primitives)) {
        var primitivesLength = primitives.length;
        for (var i = 0; i < primitivesLength; i++) {
            var primitive = primitives[i];
            var value = handler(primitive, i);

            if (defined(value)) {
                return value;
            }
        }
    }
};

ForEach.meshPrimitiveAttribute = function(primitive: any, handler: any) {
    var attributes = primitive.attributes;
    for (var semantic in attributes) {
        if (Object.prototype.hasOwnProperty.call(attributes, semantic)) {
            var value = handler(attributes[semantic], semantic);

            if (defined(value)) {
                return value;
            }
        }
    }
};

ForEach.meshPrimitiveTarget = function(primitive: any, handler: any) {
    var targets = primitive.targets;
    if (defined(targets)) {
        var length = targets.length;
        for (var i = 0; i < length; ++i) {
            var value = handler(targets[i], i);

            if (defined(value)) {
                return value;
            }
        }
    }
};

ForEach.meshPrimitiveTargetAttribute = function(target: any, handler: any) {
    for (var semantic in target) {
        if (Object.prototype.hasOwnProperty.call(target, semantic)) {
            var accessorId = target[semantic];
            var value = handler(accessorId, semantic);

            if (defined(value)) {
                return value;
            }
        }
    }
};

ForEach.node = function(gltf: any, handler: any) {
    return ForEach.topLevel(gltf, 'nodes', handler);
};

ForEach.nodeInTree = function(gltf: any, nodeIds: any, handler: any) {
    var nodes = gltf.nodes;
    if (defined(nodes)) {
        var length = nodeIds.length;
        for (var i = 0; i < length; i++) {
            var nodeId = nodeIds[i];
            var node = nodes[nodeId];
            if (defined(node)) {
                var value = handler(node, nodeId);

                if (defined(value)) {
                    return value;
                }

                var children = node.children;
                if (defined(children)) {
                    value = ForEach.nodeInTree(gltf, children, handler);

                    if (defined(value)) {
                        return value;
                    }
                }
            }
        }
    }
};

ForEach.nodeInScene = function(gltf: any, scene: any, handler: any) {
    var sceneNodeIds = scene.nodes;
    if (defined(sceneNodeIds)) {
        return ForEach.nodeInTree(gltf, sceneNodeIds, handler);
    }
};

ForEach.program = function(gltf: any, handler: any) {
    if (hasExtension(gltf, 'KHR_techniques_webgl')) {
        return ForEach.object(gltf.extensions.KHR_techniques_webgl.programs, handler);
    }

    return ForEach.topLevel(gltf, 'programs', handler);
};

ForEach.sampler = function(gltf: any, handler: any) {
    return ForEach.topLevel(gltf, 'samplers', handler);
};

ForEach.scene = function(gltf: any, handler: any) {
    return ForEach.topLevel(gltf, 'scenes', handler);
};

ForEach.shader = function(gltf: any, handler: any) {
    if (hasExtension(gltf, 'KHR_techniques_webgl')) {
        return ForEach.object(gltf.extensions.KHR_techniques_webgl.shaders, handler);
    }

    return ForEach.topLevel(gltf, 'shaders', handler);
};

ForEach.texture = function(gltf: any, handler: any) {
    return ForEach.topLevel(gltf, 'textures', handler);
};

export { ForEach };
