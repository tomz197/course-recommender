import { Button } from "@/components/ui/button"
import { useState } from "react"

function App() {
  const [pressed, setPressed] = useState(false)

  return (
    <div className="flex flex-col items-center justify-center min-h-svh">
      <Button
        onClick={() => setPressed(true)}
        className="mb-4"
        onMouseDown={(e) => e.preventDefault()}
      >
        Say hi
      </Button>
      {pressed && <p className="text-lg">Hello world!</p>}
    </div>
  )
}

export default App
