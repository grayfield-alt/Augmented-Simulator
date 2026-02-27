# Engine Integration Guide

This guide explains how to import the `augments.json` data into your game engine and implement the corresponding logic with minimal code changes.

## Recommended Engine: Unity

Unity's **ScriptableObjects** provide the cleanest way to map JSON data to game logic.

### 1. Data Structure (C#)

Create a class that matches the JSON structure.

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

### 2. Logic Mapping (C#)

Implement a simple factory or switch-case to handle the `logicType`.

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

## Import Workflow

1.  **Export**: Ensure your `augments.json` is updated in the simulator.
2.  **Import**: In Unity, use `JsonUtility.FromJson<AugmentDataList>(jsonString)` or a dedicated tool like **Newtonsoft JSON** to populate your ScriptableObjects.
3.  **Validate**: Since the logic types are strings, you can add new types in both the simulator and the engine without breaking existing data.

## Unreal Note
If using Unreal, you can create a **PrimaryDataAsset** with the same fields and use **DataTable** to import the JSON file directly. The logic would then be implemented in a C++ `FunctionLibrary` or a base `Augment` class.
