#!/usr/bin/env python3
"""Replace the Live Store Sync card in renderSettings with the Publication Token card."""
import pathlib

path = pathlib.Path("/home/z/my-project/src/components/admin-panel.tsx")
lines = path.read_text(encoding="utf-8").split("\n")

start = next(i for i, l in enumerate(lines) if "Live Store Sync (GitHub)" in l) - 1  # comment line above Card
end = next(i for i, l in enumerate(lines[start:], start) if "Main Layout" in l)
# block to replace: lines[start .. end-3] where end-3 is '  );' (end-1 is blank, end-2 is '  );'? verify below)
# tail: ... '      </Card>' , '    </div>' , '  );' , '' , '  /* ... Main Layout ... */'
assert lines[end - 1] == "", repr(lines[end - 1])
assert lines[end - 2] == "  );", repr(lines[end - 2])
assert lines[end - 3] == "    </div>", repr(lines[end - 3])
assert lines[end - 4] == "      </Card>", repr(lines[end - 4])
assert "Live Store Sync" in lines[start + 1], repr(lines[start + 1])

NEW = '''      {/* Publication Token */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-purple-950" />
            <CardTitle className="text-base">Publication Token</CardTitle>
          </div>
          <CardDescription>
            Publishes your catalog changes to the live store with one click.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tokenStatus ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="publication-token">Publication Token</Label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <Input
                    id="publication-token"
                    type="password"
                    autoComplete="off"
                    readOnly
                    disabled
                    value="•••••••••••••••••••••••••"
                    className="pl-9 pr-20 font-mono tracking-widest"
                    tabIndex={-1}
                  />
                  <span
                    className={`absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 text-[10px] font-semibold rounded-full px-2 py-0.5 border ${
                      tokenStatus.active
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    }`}
                  >
                    {tokenStatus.active ? <CheckCircle2 size={10} /> : <AlertTriangle size={10} />}
                    {tokenStatus.active ? "Active" : "Expired"}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {tokenStatus.active
                    ? tokenStatus.expiresAt
                      ? `Valid until ${tokenStatus.expiryLabel} — the field unlocks for a new token after that date.`
                      : "Custom token active — verified with GitHub."
                    : `Expired on ${tokenStatus.expiryLabel} — enter a new publication token below.`}
                </p>
              </div>

              {tokenStatus.canEdit && (
                <div className="space-y-3 p-4 rounded-lg border border-amber-200 bg-amber-50/60">
                  <div className="space-y-2">
                    <Label htmlFor="new-publication-token">New Publication Token</Label>
                    <Input
                      id="new-publication-token"
                      type="password"
                      autoComplete="off"
                      value={newToken}
                      onChange={(e) => setNewToken(e.target.value)}
                      placeholder="Paste the replacement token…"
                    />
                  </div>
                  <Button onClick={handleSaveToken} disabled={tokenSaving || !newToken.trim()} className="bg-purple-950 hover:bg-purple-800">
                    {tokenSaving ? <RefreshCw className="animate-spin mr-2" size={14} /> : <ShieldCheck size={14} className="mr-1.5" />}
                    Save & verify
                  </Button>
                </div>
              )}

              {tokenResult && (
                <div className={`text-sm rounded-md p-3 border flex items-start gap-2 ${tokenResult.ok ? "text-emerald-700 bg-emerald-50 border-emerald-200" : "text-red-700 bg-red-50 border-red-200"}`}>
                  {tokenResult.ok ? <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> : <XCircle size={16} className="mt-0.5 shrink-0" />}
                  {tokenResult.message}
                </div>
              )}
            </div>
          ) : (
            renderSkeleton(3)
          )}
        </CardContent>
      </Card>
    </div>
  );'''

new_lines = lines[:start] + NEW.split("\n") + lines[end - 1:]
path.write_text("\n".join(new_lines), encoding="utf-8")
print("replaced Live Store Sync card with Publication Token card; new total lines:", len(new_lines))
