import { useState, useEffect, useRef } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  Animated,
  useWindowDimensions,
} from "react-native";
import * as Haptics from "expo-haptics";
import * as AC from "@bacons/apple-colors";

type BrewMethod = {
  id: string;
  name: string;
  time: number; // in seconds
  icon: string;
  description: string;
};

const BREW_METHODS: BrewMethod[] = [
  {
    id: "french-press",
    name: "French Press",
    time: 240,
    icon: "☕",
    description: "Classic immersion brewing",
  },
  {
    id: "pour-over",
    name: "Pour Over",
    time: 180,
    icon: "🫗",
    description: "Precise and clean",
  },
  {
    id: "aeropress",
    name: "AeroPress",
    time: 120,
    icon: "💨",
    description: "Quick and smooth",
  },
  {
    id: "cold-brew",
    name: "Cold Brew",
    time: 43200,
    icon: "🧊",
    description: "Overnight steep",
  },
  {
    id: "espresso",
    name: "Espresso",
    time: 30,
    icon: "⚡",
    description: "Intense and bold",
  },
  {
    id: "chemex",
    name: "Chemex",
    time: 240,
    icon: "⏳",
    description: "Elegant and bright",
  },
];

export default function IndexRoute() {
  const [selectedMethod, setSelectedMethod] = useState<BrewMethod | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const { width } = useWindowDimensions();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && !isPaused && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, isPaused, timeRemaining]);

  useEffect(() => {
    if (selectedMethod && isRunning) {
      const progress = 1 - timeRemaining / selectedMethod.time;
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [timeRemaining, isRunning, selectedMethod]);

  useEffect(() => {
    if (timeRemaining === 0 && selectedMethod) {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [timeRemaining]);

  const startTimer = (method: BrewMethod) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedMethod(method);
    setTimeRemaining(method.time);
    setIsRunning(true);
    setIsPaused(false);
    progressAnim.setValue(0);
  };

  const togglePause = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsPaused(!isPaused);
  };

  const resetTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRunning(false);
    setIsPaused(false);
    setTimeRemaining(selectedMethod?.time || 0);
    progressAnim.setValue(0);
  };

  const stopTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRunning(false);
    setIsPaused(false);
    setSelectedMethod(null);
    setTimeRemaining(0);
    progressAnim.setValue(0);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  if (selectedMethod) {
    return (
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{
          flex: 1,
          backgroundColor: AC.systemBackground as any,
        }}
      >
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 32,
            gap: 32,
            minHeight: width > 768 ? "auto" : 600,
          }}
        >
          <Animated.Text
            style={{
              fontSize: 80,
              transform: [{ scale: pulseAnim }],
            }}
          >
            {selectedMethod.icon}
          </Animated.Text>

          <View style={{ alignItems: "center", gap: 8 }}>
            <Text
              style={{
                fontSize: 32,
                fontWeight: "700",
                color: AC.label as any,
              }}
            >
              {selectedMethod.name}
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: AC.secondaryLabel as any,
              }}
            >
              {selectedMethod.description}
            </Text>
          </View>

          <View
            style={{
              width: 280,
              height: 280,
              borderRadius: 140,
              backgroundColor: AC.secondarySystemBackground as any,
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Animated.View
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: AC.systemBlue as any,
                height: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
                opacity: 0.3,
              }}
            />
            <Text
              style={{
                fontSize: 64,
                fontWeight: "700",
                fontVariant: ["tabular-nums"],
                color:
                  timeRemaining === 0 ? (AC.systemGreen as any) : (AC.label as any),
              }}
            >
              {formatTime(timeRemaining)}
            </Text>
          </View>

          {timeRemaining === 0 ? (
            <View style={{ alignItems: "center", gap: 16 }}>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "700",
                  color: AC.systemGreen as any,
                }}
              >
                Ready! ✨
              </Text>
              <Pressable
                onPress={stopTimer}
                style={({ pressed }) => ({
                  backgroundColor: AC.systemBlue as any,
                  paddingVertical: 16,
                  paddingHorizontal: 48,
                  borderRadius: 16,
                  borderCurve: "continuous",
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: 18,
                    fontWeight: "600",
                  }}
                >
                  Done
                </Text>
              </Pressable>
            </View>
          ) : (
            <View style={{ flexDirection: "row", gap: 12 }}>
              <Pressable
                onPress={togglePause}
                style={({ pressed }) => ({
                  backgroundColor: AC.systemBlue as any,
                  paddingVertical: 16,
                  paddingHorizontal: 32,
                  borderRadius: 16,
                  borderCurve: "continuous",
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: 18,
                    fontWeight: "600",
                  }}
                >
                  {isPaused ? "Resume" : "Pause"}
                </Text>
              </Pressable>
              <Pressable
                onPress={resetTimer}
                style={({ pressed }) => ({
                  backgroundColor: AC.systemOrange as any,
                  paddingVertical: 16,
                  paddingHorizontal: 32,
                  borderRadius: 16,
                  borderCurve: "continuous",
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: 18,
                    fontWeight: "600",
                  }}
                >
                  Reset
                </Text>
              </Pressable>
              <Pressable
                onPress={stopTimer}
                style={({ pressed }) => ({
                  backgroundColor: AC.systemRed as any,
                  paddingVertical: 16,
                  paddingHorizontal: 32,
                  borderRadius: 16,
                  borderCurve: "continuous",
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: 18,
                    fontWeight: "600",
                  }}
                >
                  Stop
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{
        flex: 1,
        backgroundColor: AC.systemBackground as any,
      }}
    >
      <View
        style={{
          padding: 20,
          gap: 24,
        }}
      >
        <View style={{ gap: 8 }}>
          <Text
            style={{
              fontSize: 34,
              fontWeight: "700",
              color: AC.label as any,
            }}
          >
            Coffee Timer
          </Text>
          <Text
            style={{
              fontSize: 17,
              color: AC.secondaryLabel as any,
            }}
          >
            Select your brewing method to start
          </Text>
        </View>

        <View
          style={{
            gap: 12,
          }}
        >
          {BREW_METHODS.map((method) => (
            <Pressable
              key={method.id}
              onPress={() => startTimer(method)}
              style={({ pressed }) => ({
                backgroundColor: AC.secondarySystemBackground as any,
                padding: 20,
                borderRadius: 16,
                borderCurve: "continuous",
                flexDirection: "row",
                alignItems: "center",
                gap: 16,
                opacity: pressed ? 0.7 : 1,
                transform: pressed ? [{ scale: 0.98 }] : [{ scale: 1 }],
              })}
            >
              <Text style={{ fontSize: 48 }}>{method.icon}</Text>
              <View style={{ flex: 1, gap: 4 }}>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "600",
                    color: AC.label as any,
                  }}
                >
                  {method.name}
                </Text>
                <Text
                  style={{
                    fontSize: 15,
                    color: AC.secondaryLabel as any,
                  }}
                >
                  {method.description}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: "600",
                  color: AC.systemBlue as any,
                  fontVariant: ["tabular-nums"],
                }}
              >
                {formatTime(method.time)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
