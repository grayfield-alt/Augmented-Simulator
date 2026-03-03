import React, { useState, useEffect } from 'react';

const MonsterDebugger = ({ monsters, onUpdateSettings }) => {
    const [settings, setSettings] = useState({
        telegraphMult: 1.0,
        postDelayMult: 1.0,
        variance: 0,
        hitStop: 3,
        shakeScale: 1.0
    });

    const handleChange = (key, value) => {
        const newSettings = { ...settings, [key]: parseFloat(value) };
        setSettings(newSettings);
        onUpdateSettings(newSettings);
    };

    return (
        <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            width: '250px',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '15px',
            borderRadius: '8px',
            fontSize: '12px',
            fontFamily: 'sans-serif',
            zIndex: 1000,
            boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
            border: '1px solid #444'
        }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#ff4a4a', borderBottom: '1px solid #444', paddingBottom: '5px' }}>
                👾 몬스터 세팅 (손맛 테스트)
            </h3>

            <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>
                    전조 시간 배율 (Telegraph): {settings.telegraphMult.toFixed(1)}x
                    <input
                        type="range" min="0.1" max="3.0" step="0.1"
                        value={settings.telegraphMult}
                        onChange={(e) => handleChange('telegraphMult', e.target.value)}
                        style={{ width: '100%' }}
                    />
                </label>
            </div>

            <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>
                    공격 후 딜레이 배율: {settings.postDelayMult.toFixed(1)}x
                    <input
                        type="range" min="0.1" max="3.0" step="0.1"
                        value={settings.postDelayMult}
                        onChange={(e) => handleChange('postDelayMult', e.target.value)}
                        style={{ width: '100%' }}
                    />
                </label>
            </div>

            <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>
                    타이밍 가변성 (Variance): ±{settings.variance}f
                    <input
                        type="range" min="0" max="30" step="1"
                        value={settings.variance}
                        onChange={(e) => handleChange('variance', e.target.value)}
                        style={{ width: '100%' }}
                    />
                </label>
            </div>

            <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>
                    피격 경직 (Hit Stop): {settings.hitStop}f
                    <input
                        type="range" min="0" max="20" step="1"
                        value={settings.hitStop}
                        onChange={(e) => handleChange('hitStop', e.target.value)}
                        style={{ width: '100%' }}
                    />
                </label>
            </div>

            <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>
                    화면 흔들림 배율: {settings.shakeScale.toFixed(1)}x
                    <input
                        type="range" min="0.0" max="5.0" step="0.1"
                        value={settings.shakeScale}
                        onChange={(e) => handleChange('shakeScale', e.target.value)}
                        style={{ width: '100%' }}
                    />
                </label>
            </div>

            <button
                onClick={() => console.log('Current Settings:', JSON.stringify(settings, null, 2))}
                style={{
                    width: '100%',
                    padding: '8px',
                    backgroundColor: '#444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                현재 설정 로그 출력 (JSON)
            </button>
            <p style={{ fontSize: '10px', color: '#888', marginTop: '10px' }}>
                * 공격 진행 중인 파라미터는 다음 패턴부터 적용됩니다.
            </p>
        </div>
    );
};

export default MonsterDebugger;
