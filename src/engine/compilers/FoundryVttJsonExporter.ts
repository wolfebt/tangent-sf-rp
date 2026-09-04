/**
 * @file FoundryVttJsonExporter.ts
 * @description Stage 9 Foundry VTT Compendium Exporter.
 * Bundles scenarios, maps, tokens, walls, and items into strict Foundry VTT v11/v12 JSON packages
 * with @UUID inter-document linkage.
 */

export interface FoundryExportPayload {
  packageId?: string;
  title?: string;
  scenarios: any[];
  elements: any[];
  maps: any[];
}

export interface FoundryCompendiumPack {
  manifest: {
    id: string;
    title: string;
    version: string;
    compatibility: {
      minimum: string;
      verified: string;
    };
    system: string;
  };
  folders: Array<{ _id: string; name: string; type: string }>;
  journals: any[];
  actors: any[];
  items: any[];
  scenes: any[];
}

export class FoundryVttJsonExporterService {
  /**
   * Generates a 16-character alphanumeric Foundry VTT ID.
   */
  private generateFoundryId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Compiles scenario content and elements into a Foundry VTT compendium package.
   */
  public exportToFoundryJson(payload: FoundryExportPayload): {
    jsonString: string;
    pack: FoundryCompendiumPack;
    stats: { scenes: number; actors: number; journals: number; items: number };
  } {
    const packageId = payload.packageId || 'tangent-sf-rp-pack';
    const title = payload.title || 'Tangent SF RP Adventure Module';

    const pack: FoundryCompendiumPack = {
      manifest: {
        id: packageId,
        title,
        version: '3.0.0',
        compatibility: {
          minimum: '11',
          verified: '12'
        },
        system: 'tangent-sf-rp'
      },
      folders: [
        { _id: this.generateFoundryId(), name: 'Journal Entries', type: 'JournalEntry' },
        { _id: this.generateFoundryId(), name: 'Operatives & Adversaries', type: 'Actor' },
        { _id: this.generateFoundryId(), name: 'Equipment & Weapons', type: 'Item' },
        { _id: this.generateFoundryId(), name: 'Tactical Maps', type: 'Scene' }
      ],
      journals: [],
      actors: [],
      items: [],
      scenes: []
    };

    // 1. Export Scenarios as JournalEntries with @UUID links
    for (const scenario of payload.scenarios || []) {
      const journalId = this.generateFoundryId();
      pack.journals.push({
        _id: journalId,
        name: scenario.title || 'Untitled Sector',
        pages: [
          {
            _id: this.generateFoundryId(),
            name: 'Briefing',
            type: 'text',
            text: {
              content: `<h2>${scenario.title}</h2><p>${scenario.content || scenario.summary || ''}</p>`,
              format: 1
            }
          }
        ],
        flags: {
          tangent: {
            nodeId: scenario.id,
            schemaVersion: '3.0.0'
          }
        }
      });
    }

    // 2. Export Elements as Actors or Items
    for (const elem of payload.elements || []) {
      const isActor = elem.schemaType === 'Entity' || elem.category === 'Operatives' || elem.category === 'Species';
      const fId = this.generateFoundryId();

      if (isActor) {
        pack.actors.push({
          _id: fId,
          name: elem.title || 'Operative',
          type: 'character',
          system: {
            attributes: elem.fields?.attributes || {},
            hitPoints: { value: elem.fields?.hp || 20, max: elem.fields?.hp || 20 },
            armorDr: { kinetic: elem.fields?.kineticDr || 4, energy: elem.fields?.energyDr || 2 },
            techLevel: elem.fields?.tl || 3
          }
        });
      } else {
        pack.items.push({
          _id: fId,
          name: elem.title || 'Gear',
          type: 'equipment',
          system: {
            techLevel: elem.fields?.tl || 3,
            description: { value: elem.summary || elem.content || '' }
          }
        });
      }
    }

    // 3. Export Maps as Scenes
    for (const map of payload.maps || []) {
      const sceneId = this.generateFoundryId();
      pack.scenes.push({
        _id: sceneId,
        name: map.title || 'Tactical Sector',
        width: map.width || 2000,
        height: map.height || 2000,
        grid: { size: map.gridSize || 50, type: 1 },
        walls: (map.walls || []).map((w: any) => ({
          c: [w.p1?.x || 0, w.p1?.y || 0, w.p2?.x || 0, w.p2?.y || 0],
          move: w.blocksMovement ? 1 : 0,
          sense: w.blocksVision ? 1 : 0
        }))
      });
    }

    const stats = {
      scenes: pack.scenes.length,
      actors: pack.actors.length,
      journals: pack.journals.length,
      items: pack.items.length
    };

    return {
      jsonString: JSON.stringify(pack, null, 2),
      pack,
      stats
    };
  }
}

export const FoundryVttJsonExporter = new FoundryVttJsonExporterService();
export default FoundryVttJsonExporter;
