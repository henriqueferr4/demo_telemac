import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Label
} from "recharts";

export default function ChartNivel({ estacaoSelecionada }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const arquivosObservado = {
    1: "/data/observado/sensor_FURG_CCMAR.json",
    2: "/data/observado/sensor_S_Lourenco.json",
    3: "/data/observado/sensor_Arambare.json",
    4: "/data/observado/sensor_S_Jose_Norte.json",
    5: "/data/observado/sensor_Itapua.json"
  };

  const arquivosPrevisao = {
    1: "data/previsao/nivel/estacoes/FURG_CCMAR.json",
    2: "data/previsao/nivel/estacoes/S_Lourenco.json",
    3: "data/previsao/nivel/estacoes/Arambare.json", 
    4: "data/previsao/nivel/estacoes/S_Jose_Norte.json",
    5: "data/previsao/nivel/estacoes/Itapua.json"
  };

  // CORREÇÃO: Ticks calculados com base no timestamp numérico estável
  const ticks12h = data && data.length > 0
    ? data
        .filter((item) => {
          if (!item || !item.timestamp) return false;
          const d = new Date(item.timestamp);
          return !isNaN(d.getTime()) && d.getHours() === 12 && d.getMinutes() === 0;
        })
        .map((item) => item.timestamp)
    : [];

  useEffect(() => {
    if (!estacaoSelecionada) return;

    setLoading(true);

    Promise.all([
      fetch(arquivosObservado[estacaoSelecionada.id]).then(res => res.json()).catch(() => []),
      fetch(arquivosPrevisao[estacaoSelecionada.id]).then(res => res.json()).catch(() => [])
    ])
      .then(([jsonObservado, jsonPrevisao]) => {
        const mapaAgrupado = {};

        const obterTimestamp = (dateStr) => {
        if (!dateStr) return null;
        let dataPadronizada = dateStr.includes(" ") ? dateStr.replace(" ", "T") : dateStr;
        
        dataPadronizada = dataPadronizada.replace(/Z$/, "").split(".")[0]; 

        const d = new Date(dataPadronizada);
        return !isNaN(d.getTime()) ? d.getTime() : null;
        };

        // 1. Processa dados Observados utilizando o timestamp numérico como chave
        jsonObservado.forEach((item) => {
          const ts = obterTimestamp(item.data);
          if (!ts) return;

          mapaAgrupado[ts] = {
            timestamp: ts, // Guardado explicitamente para o XAxis
            dataOriginal: item.data,
            observado: item.valor,
            previsao: null 
          };
        });

        // 2. Processa Previsões utilizando o mesmo timestamp estável
        jsonPrevisao.forEach((item) => {
          const ts = obterTimestamp(item.data);
          if (!ts) return;

          const valorEmCentimetros = item.valor !== null && item.valor !== undefined
            ? Number((item.valor * 100).toFixed(1)) 
            : null;

          if (mapaAgrupado[ts]) {
            mapaAgrupado[ts].previsao = valorEmCentimetros;
          } else {
            mapaAgrupado[ts] = {
              timestamp: ts,
              dataOriginal: item.data,
              observado: null,
              previsao: valorEmCentimetros
            };
          }
        });

        // 3. Ordenação cronológica por número puro (à prova de falhas)
        const listaUnificada = Object.values(mapaAgrupado).sort((a, b) => a.timestamp - b.timestamp);



        setData(listaUnificada);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erro geral na unificação das séries:", error);
        setLoading(false);
      });

  }, [estacaoSelecionada]);

  if (loading) {
    return (
      <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", color: "#2A3D59", fontSize: "12px", fontWeight: "600" }}>
        Sincronizando séries temporais...
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "100%", minHeight: "200px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 10, right: 30, left: 10, bottom: 25 }}
        >
          <CartesianGrid strokeDasharray="3 3" />

          {/* MUDANÇA CRÍTICA: Eixo X agora opera como tipo "number" lendo a chave "timestamp" */}
          <XAxis
            dataKey="timestamp"
            type="number"
            domain={['dataMin', 'dataMax']}
            ticks={ticks12h}
            tickFormatter={(value) => {
              const d = new Date(value);
              return isNaN(d.getTime()) 
                ? "" 
                : d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
            }}
            label={{
              value: "Data",
              position: "insideBottom",
              offset: -10,
              dy: 5,
              style: { fill: "#5f5f5fff", fontWeight: "600", fontSize: "16px" }
            }}
          />

          <YAxis>
            <Label
              value="Nível (cm)"
              angle={-90}
              position="insideLeft"
              style={{ textAnchor: "middle", fill: "#5f5f5fff", fontWeight: "600", fontSize: "16px" }}
            />
          </YAxis>

          <Tooltip
            labelFormatter={(label) => {
              const d = new Date(label);
              return isNaN(d.getTime()) 
                ? label 
                : `Data: ${d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}`;
            }}
            formatter={(value, name) => [value !== null && value !== undefined ? `${value} cm` : "Ausente", name]}
          />

          <Legend
            layout="horizontal"
            align="center"
            verticalAlign="top"
            iconType="circle"
            iconSize={10}
            wrapperStyle={{ paddingBottom: "15px", fontSize: "13px", fontWeight: "600", color: "#2A3D59" }}
          />

          <Line
            type="monotone"
            dataKey="observado"
            name="Observado"
            stroke="#ff7300"
            strokeWidth={2.5}
            dot={false}
            connectNulls={true}
          />

          <Line
            type="linear"
            dataKey="previsao"
            name="Previsão"
            stroke="#2A3D59"
            strokeWidth={2.5}
            strokeDasharray=""
            dot={false}
            connectNulls={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}