import cron from 'node-cron';
import { MorningBriefing } from './morningBriefing';
import { SupplyChainPredictor } from './supplyChainPredictor';

export class CronScheduler {
  private morningBriefing: MorningBriefing;
  private supplyChainPredictor: SupplyChainPredictor;

  constructor() {
    this.morningBriefing = new MorningBriefing();
    this.supplyChainPredictor = new SupplyChainPredictor();
  }

  /**
   * Inicia el orquestador maestro (Debe ejecutarse al arrancar el backend de producción)
   */
  start(): void {
    console.log("[Cron Scheduler] Iniciando Master Clock. Tareas programas a las 08:00 AM.");

    // Cron expression: '0 8 * * *' -> Todos los días a las 08:00 hrs
    cron.schedule('0 8 * * *', async () => {
      console.log("==========================================");
      console.log(`[Cron Scheduler] EJECUTANDO TAREAS DE LAS 08:00 AM - ${new Date().toLocaleDateString()}`);
      console.log("==========================================");

      try {
        // 1. Módulo 16: Morning Briefing
        await this.morningBriefing.execute();

        // 2. Módulo 17: Predicción de Suministro (Mocking un catálogo de 2 items)
        const dummyInventory = [
          { name: "Erba Pura (Xerjoff)", currentStock: 45, velocityRate: 5, supplierLeadTime: 10, supplierName: "DistriPerfumes Chile" },
          { name: "Naxos (Xerjoff)", currentStock: 120, velocityRate: 2, supplierLeadTime: 10, supplierName: "DistriPerfumes Chile" }
        ];
        
        await this.supplyChainPredictor.runInventoryAnalysis(dummyInventory);

        console.log("[Cron Scheduler] Ejecución matutina completada sin errores fatales.");
      } catch (error) {
        console.error("[Cron Scheduler] Error masivo durante las tareas matutinas:", error);
      }
    }, {
      timezone: "America/Santiago" // Zona horaria de Chile
    });
  }
}
