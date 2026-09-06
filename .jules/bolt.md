## 2024-05-18 - [Optimize RosterCatalogView filter]
**Learning:** Found multiple usages of array filtering unmemoized that runs dynamically on text inputs. For components handling robust datasets that perform local filtering, standardizing `useMemo` on text query changes drastically limits DOM blocking.
**Action:** Always wrap text-based `.filter` loops on dataset arrays within `useMemo` hooks using the dataset and the text search value as the dependencies.
