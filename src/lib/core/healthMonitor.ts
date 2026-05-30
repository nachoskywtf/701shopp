export class HealthMonitor {
  private static instance: HealthMonitor;
  private failures: Record<string, number> = {};
  private circuitStates: Record<string, 'CLOSED' | 'OPEN' | 'HALF_OPEN'> = {};
  private readonly FAILURE_THRESHOLD = 3;
  private readonly RESET_TIMEOUT_MS = 60000 * 5; // 5 minutos

  private constructor() {}

  public static getInstance(): HealthMonitor {
    if (!HealthMonitor.instance) {
      HealthMonitor.instance = new HealthMonitor();
    }
    return HealthMonitor.instance;
  }

  /**
   * Envía una alerta de sistema al Módulo 16 (WhatsApp)
   */
  private alertSystem(serviceName: string, message: string) {
    console.error(`🚨 [CIRCUIT BREAKER] Servicio: ${serviceName} -> ${message}`);
    // Aquí se invocaría el MorningBriefing o webhook de alertas
    // ej: webhook.send(`ALERTA: ${serviceName} ha sido pausado.`)
  }

  /**
   * Comprueba si un microservicio puede ser invocado.
   */
  public canExecute(serviceName: string): boolean {
    const state = this.circuitStates[serviceName] || 'CLOSED';
    return state === 'CLOSED' || state === 'HALF_OPEN';
  }

  /**
   * Registra una ejecución exitosa, reseteando fallos y cerrando circuitos abiertos.
   */
  public reportSuccess(serviceName: string) {
    this.failures[serviceName] = 0;
    if (this.circuitStates[serviceName] !== 'CLOSED') {
      this.circuitStates[serviceName] = 'CLOSED';
      console.log(`✅ [CIRCUIT BREAKER] Servicio ${serviceName} recuperado. Circuito CERRADO.`);
    }
  }

  /**
   * Registra un fallo. Si alcanza el umbral, abre el circuito.
   */
  public reportFailure(serviceName: string, errorMsg: string) {
    this.failures[serviceName] = (this.failures[serviceName] || 0) + 1;
    
    console.warn(`⚠️ [CIRCUIT BREAKER] Fallo reportado en ${serviceName} (${this.failures[serviceName]}/${this.FAILURE_THRESHOLD}). Motivo: ${errorMsg}`);

    if (this.failures[serviceName] >= this.FAILURE_THRESHOLD && this.circuitStates[serviceName] !== 'OPEN') {
      this.circuitStates[serviceName] = 'OPEN';
      this.alertSystem(serviceName, "Umbral de fallos superado. Circuito ABIERTO. Tráfico pausado hacia este nodo.");
      
      // Auto-Heal: Programar un intento de recuperación (Half-Open)
      setTimeout(() => {
        this.circuitStates[serviceName] = 'HALF_OPEN';
        console.log(`🔄 [CIRCUIT BREAKER] ${serviceName} en estado HALF_OPEN. Listo para test de recuperación.`);
      }, this.RESET_TIMEOUT_MS);
    }
  }

  /**
   * Retorna el estado global actual de todos los nodos monitoreados
   */
  public getSystemHealth() {
    const services = ['META_GRAPH_API', 'FLOW_PAYMENT', 'STARKEN_API', 'SUPABASE_PG', 'APIFY_SCRAPER'];
    const health = services.map(svc => ({
      name: svc,
      status: this.circuitStates[svc] || 'CLOSED',
      failures: this.failures[svc] || 0
    }));

    return health;
  }
}

// Global Error Handler (Uncaught Exceptions)
if (typeof process !== 'undefined') {
  process.on('uncaughtException', (err) => {
    console.error("🔥 [FATAL] Excepción no capturada:", err);
    // Evitar que el sistema colapse completamente
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error("🔥 [FATAL] Promesa rechazada no capturada:", reason);
  });
}
