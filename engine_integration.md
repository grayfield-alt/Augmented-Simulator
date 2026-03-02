# 엔진 연동 가이드

이 가이드는 `augments.json` 데이터를 게임 엔진으로 가져오고 최소한의 코드 변경으로 해당 로직을 구현하는 방법을 설명합니다.

## 권장 엔진: Unity

Unity의 **ScriptableObjects**를 사용하면 JSON 데이터를 게임 로직에 가장 깔끔하게 매핑할 수 있습니다.

### 1. 데이터 구조 (C#)

JSON 구조와 일치하는 클래스를 생성합니다.

```csharp
using UnityEngine;

[System.Serializable]
public class AugmentData
{
    public string id;
    public string name;
    public string type;
    public string logicType;
    public string description;
    public string trigger;
    public float value;
    public float atkBonus;
    public float extraDamage;
}
```

### 2. 로직 매핑 (C#)

`logicType`을 처리하기 위한 간단한 팩토리 또는 switch-case를 구현합니다.

```csharp
public class AugmentLogic
{
    public static void Apply(AugmentData data, CombatState state)
    {
        switch (data.logicType)
        {
            case "CHANCE_RESCUE":
                if (!state.isParried && Random.value < data.value) {
                    state.isParried = true;
                }
                break;
                
            case "CHANCE_DAMAGE":
                if (Random.value < data.value) {
                    state.monster.hp -= data.extraDamage;
                }
                break;
        }
    }
}
```

## 가져오기 워크플로우

1.  **내보내기**: 시뮬레이터에서 `augments.json`이 최신 상태인지 확인합니다.
2.  **가져오기**: Unity에서 `JsonUtility.FromJson<AugmentDataList>(jsonString)` 또는 **Newtonsoft JSON**과 같은 전용 도구를 사용하여 ScriptableObjects에 데이터를 채웁니다.
3.  **검증**: 로직 유형이 문자열이므로 기존 데이터를 손상시키지 않고 시뮬레이터와 엔진 모두에서 새로운 유형을 추가할 수 있습니다.

## Unreal 관련 참고사항
Unreal을 사용하는 경우 동일한 필드를 가진 **PrimaryDataAsset**을 생성하고 **DataTable**을 사용하여 JSON 파일을 직접 가져올 수 있습니다. 로직은 C++ `FunctionLibrary` 또는 기본 `Augment` 클래스에서 구현됩니다.
