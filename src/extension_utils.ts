// Copyright 2020 Workiva Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import * as yaml from 'yaml';
import { satisfies, minVersion, parse } from 'semver';
const isString = (value: unknown): value is string => typeof value === 'string';

const dependencyKey = 'dependencies';
const devDependencyKey = 'dev_dependencies';

function getDependencyVersion(document:yaml.Document, dependency:string, isADevDependency:boolean = false):string|undefined {
    const key = isADevDependency ? devDependencyKey : dependencyKey;
    if (document.contents.has(key)) {
        const dependencyCollection = document.contents.get(key);
        if (dependencyCollection !== null && dependencyCollection.has(dependency)) {
            const collectedDependency = dependencyCollection.get(dependency);
    
            // Simple key value dependencies (e.g. not hosted ones) are simple
            // strings here. Otherwise, we need to do `get` one more time.
            if (isString(collectedDependency)) {
                return collectedDependency;
            } else {
                return collectedDependency.get('version');
            }
        }
    }

    return undefined;
}

// Verifies that a provided dependency is present and has a minimum version that matches a given dependency range.
//
// Returns false if the dependency does not exist, is invalid, or is below the provided range.
// Expects `dependency` to be the exact dependency string, `qualifyingRange` to be a compatible semver range.
export function dependencyHasValidMinVersion(dependency:string, qualifyingRange:string, pubspecContents:string, isADevDependency:boolean = false):Boolean {
    const pubspec:yaml.Document = yaml.parseDocument(pubspecContents);
    const rawRange:string|undefined = getDependencyVersion(pubspec, dependency, isADevDependency);
    if (rawRange === undefined) return false;
    const minRangeValue = parse(minVersion(rawRange));
    if (minRangeValue === null) return false;

    return satisfies(minRangeValue, qualifyingRange);
}

// Checks a dependency against a pubspec.yaml's dev_dependency section and returns whether
// or not it is present. 
export function devDependenciesContains(dependency:string, pubspecContents:string):Boolean {
    const pubspec:yaml.Document = yaml.parseDocument(pubspecContents);
    if (pubspec.contents.has(devDependencyKey)) {
        const dev_dependencies = pubspec.contents.get(devDependencyKey);
        if (dev_dependencies !== null) {
            return dev_dependencies.has(dependency);
        }
    }

    return false;
}
