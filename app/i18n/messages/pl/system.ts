import type { Messages } from "@/app/i18n/messages/en";
import { pluralPl } from "@/app/i18n/plural";

const system: Messages["system"] = {
  title: "System",
  description: "Usługi i obciążenie serwera, odświeżane co 10 sekund.",
  readAt: (time) => `Odczyt z ${time}`,
  stale: (time) => `Nie udało się odświeżyć. Pokazujemy odczyt z ${time}.`,
  loadError: "Nie udało się wczytać stanu systemu.",
  grafana: "Grafana",
  grafanaContext: "dashboardy, otwiera się w nowej karcie",

  checks: {
    heading: "Usługi",
    names: { db: "Baza danych", rabbitmq: "RabbitMQ", prometheus: "Prometheus" },
    status: { up: "Działa", down: "Nie odpowiada", degraded: "Błędy zapytań", disabled: "Nieskonfigurowany" },
    latency: (ms) => `${ms} ms`,
    queue: "Kolejka skanów",
    waiting: (count) => pluralPl(count, "oczekujący", "oczekujące", "oczekujących"),
    running: (count) => `${count} w toku`,
  },

  node: {
    uptime: (duration) => `Działa od ${duration}`,
    cpu: "Procesor",
    cores: (count) => `${count} ${pluralPl(count, "rdzeń", "rdzenie", "rdzeni")}`,
    load: (values) => `load ${values}`,
    memory: "Pamięć",
    disk: "Dysk",
    network: "Sieć",
    of: (used, total) => `${used} z ${total}`,
    received: "pobieranie",
    sent: "wysyłanie",
  },

  history: {
    heading: (minutes) => `Ostatnie ${minutes} minut`,
    load: "Procesor i pamięć",
    network: "Sieć",
    cpu: "Procesor",
    memory: "Pamięć",
    received: "Pobieranie",
    sent: "Wysyłanie",
    empty: "Nie ma jeszcze historii. Prometheus potrzebuje kilku minut danych.",
  },

  workloads: {
    heading: "Pody",
    columns: { namespace: "Namespace", pod: "Pod", status: "Stan", restarts: "Restarty", cpu: "CPU", memory: "Pamięć" },
    ready: "Gotowy",
    notReady: "Niegotowy",
    empty: "Brak danych o podach. Ten Prometheus nie zbiera kube-state-metrics.",
  },

  prometheus: {
    disabled: "Obciążenie serwera wymaga Prometheusa. Ustaw PROMETHEUS_URL w backendzie, żeby je pokazać.",
    down: "Prometheus nie odpowiada, więc widać tylko usługi.",
    degraded: "Prometheus odpowiada, ale jego zapytania kończą się błędem. Sprawdź, czy zbiera node-exporter i kube-state-metrics.",
  },
};

export default system;
