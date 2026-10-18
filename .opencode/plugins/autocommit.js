const MESSAGE = "chore: auto-commit changes made in opencode"

export const AutoCommitPlugin = async ({ $, directory }) => {
  let running = false

  async function commitAndPush() {
    if (running) return
    running = true
    try {
      await $`git -C ${directory} add -A`.quiet().nothrow()

      const status = await $`git -C ${directory} status --porcelain`.quiet().nothrow()
      if (!status.stdout.toString().trim()) return

      const stamp = new Date().toISOString()
      await $`git -C ${directory} commit -m ${`${MESSAGE} (${stamp})`}`.quiet().nothrow()

      await $`git -C ${directory} push`.quiet().nothrow()
    } finally {
      running = false
    }
  }

  return {
    event: async ({ event }) => {
      if (event.type === "session.idle") await commitAndPush()
    },
  }
}
