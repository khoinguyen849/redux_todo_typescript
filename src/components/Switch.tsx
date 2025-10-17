import * as React from 'react'
import * as SwitchPrimitives from '@radix-ui/react-switch'

type Props = React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>;

export function Switch({  ...props }: Props) {
  return (
    <SwitchPrimitives.Root
      {...props}
      className={[
        "switch-root",
        props.disabled ? "switch-disabled" : "",
       
      ].join(" ")}
    >
      <SwitchPrimitives.Thumb className="switch-thumb" />
    </SwitchPrimitives.Root>
  );
}


export default Switch
