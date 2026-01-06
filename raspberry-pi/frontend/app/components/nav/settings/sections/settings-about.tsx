import packageJson from "~/../package.json"

export function AboutSection() {
  return (
    <div className="space-y-6 max-w-112.5">
      <div className="space-y-4">
        <div className="flex items-center justify-between space-x-2">
          <div>
            <label className="text-sm">Application Name</label>
            <p className="text-xs text-muted-foreground">Current application name</p>
          </div>
          <p className="text-sm capitalize">{packageJson.name}</p>
        </div>

        <div className="flex items-center justify-between space-x-2">
          <div>
            <label className="text-sm">Version</label>
            <p className="text-xs text-muted-foreground">Current version number</p>
          </div>
          <p className="text-sm">{packageJson.version}</p>
        </div>
      </div>
    </div>
  )
}
