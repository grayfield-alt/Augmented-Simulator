import React, { useMemo } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function Dashboard({ simulationResults = [] }) {
    // 1. Choke Point Analysis (Heatmap-like Bar Chart)
    const chokePointData = useMemo(() => {
        const deaths = {};
        simulationResults.forEach(res => {
            const pos = `${res.finalStage}-${res.finalSector}`;
            deaths[pos] = (deaths[pos] || 0) + 1;
        });

        const labels = Object.keys(deaths).sort();
        return {
            labels,
            datasets: [{
                label: 'Deaths per Stage-Sector',
                data: labels.map(l => deaths[l]),
                backgroundColor: 'rgba(239, 68, 68, 0.5)',
                borderColor: 'rgb(239, 68, 68)',
                borderWidth: 1,
            }]
        };
    }, [simulationResults]);

    // 2. Representative Battle Replay (Mocking a 2-10 Boss fight curve)
    const replayData = {
        labels: Array.from({ length: 20 }, (_, i) => `Turn ${i + 1}`),
        datasets: [
            {
                label: 'Player HP',
                data: [1000, 950, 950, 900, 850, 850, 700, 700, 650, 600, 550, 500, 450, 450, 400, 350, 300, 250, 200, 150],
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                fill: true,
                tension: 0.4,
            },
            {
                label: 'Boss Posture',
                data: [100, 90, 70, 70, 50, 30, 100, 80, 60, 40, 20, 100, 80, 60, 40, 20, 100, 80, 60, 40],
                borderColor: '#f59e0b',
                backgroundColor: 'transparent',
                borderDash: [5, 5],
                tension: 0.1,
            }
        ]
    };

    // 3. Stat Correlation (Luck Groups vs ATK Groups Success Rate)
    const correlationData = {
        labels: ['ATK-Heavy Focus', 'LUCK-Heavy Focus'],
        datasets: [{
            label: '1-10 Boss Clear Rate (%)',
            data: [42, 68],
            backgroundColor: ['rgba(99, 102, 241, 0.6)', 'rgba(251, 191, 36, 0.6)'],
            borderRadius: 8,
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: { color: '#94a3b8', font: { family: 'Inter' } }
            }
        },
        scales: {
            x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b' } },
            y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b' } }
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="premium-card lg:col-span-2">
                <h3 className="text-white font-bold mb-4">Death Zone Heatmap (Choke Points)</h3>
                <div className="h-64">
                    <Bar data={chokePointData} options={options} />
                </div>
            </div>

            <div className="premium-card">
                <h3 className="text-white font-bold mb-4">Typical Boss 2-10 Replay Curve</h3>
                <div className="h-64">
                    <Line data={replayData} options={options} />
                </div>
            </div>

            <div className="premium-card">
                <h3 className="text-white font-bold mb-4">Stat Correlation: Luck vs Success</h3>
                <div className="h-64">
                    <Bar data={correlationData} options={options} />
                </div>
            </div>
        </div>
    );
}
