import { Handle, HandleProps } from "@xyflow/react"

const CustomHandle = (props: HandleProps) => {
  return (
    <Handle
      style={{
        width: '10px',
        height: '10px',
        background: 'white',
        border: '1px solid #000',
      }}
      {...props}
    />
  )
}
export default CustomHandle