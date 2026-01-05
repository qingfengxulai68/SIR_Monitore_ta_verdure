const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="border-border/50 bg-background grid items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl">
        <p className="font-medium">{label}</p>
        <div className="flex w-full flex-wrap items-stretch gap-2">
          <div
            className="shrink-0 h-2.5 w-2.5 rounded-[2px]"
            style={{
              backgroundColor: payload[0].color
            }}
          />
          <div className="flex flex-1 justify-between leading-none items-center gap-4">
            <span className="text-muted-foreground">
              {payload[0].dataKey === "humidity" && "Humidity"}
              {payload[0].dataKey === "light" && "Light"}
              {payload[0].dataKey === "moisture" && "Moisture"}
              {payload[0].dataKey === "temperature" && "Temperature"}
            </span>
            <span className="text-foreground font-mono font-medium tabular-nums">
              {payload[0].dataKey === "humidity" && `${payload[0].value}%`}
              {payload[0].dataKey === "light" && `${payload[0].value} lux`}
              {payload[0].dataKey === "moisture" && `${payload[0].value}%`}
              {payload[0].dataKey === "temperature" && `${payload[0].value}°C`}
            </span>
          </div>
        </div>
      </div>
    )
  }
  return null
}

export { CustomTooltip }
