import type { Meta, StoryObj } from "@storybook/react";
import { StepNumberInput } from "../components/step-number-input";
import { useState } from "@storybook/preview-api";

const meta: Meta = {
    title: "Input/Step number",
    component: StepNumberInput,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    args: {
        label: "Step number input",
        placeholder: "Placeholder",
        onChange: () => {},
    },
    argTypes: {
        step: {
            type: "number",
        },
    },
} satisfies Meta<typeof StepNumberInput>;

export default meta;
type Story = StoryObj<typeof StepNumberInput>;

export const Base: Story = {
    render: (args) => {
        const [value, setValue] = useState<number | undefined>(undefined);

        function handleOnChange(value: number | undefined) {
            setValue(value);
        }

        function handleOnIncrement() {
            if (!value) return;
            setValue(value + 3);
        }

        function handleOnDecrement() {
            if (!value) return;
            setValue(value - 3);
        }

        return (
            <StepNumberInput
                {...args}
                prefix="$"
                placeholder="$0"
                value={value}
                onChange={handleOnChange}
                onIncrement={handleOnIncrement}
                onDecrement={handleOnDecrement}
            />
        );
    },
};

export const Loading: Story = {
    args: {
        loading: true,
    },
};

export const Sizes: Story = {
    render: (args) => (
        <div className="flex flex-col gap-4">
            <StepNumberInput {...args} size="xs" />
            <StepNumberInput {...args} size="sm" />
            <StepNumberInput {...args} size="base" />
            <StepNumberInput {...args} size="lg" />
        </div>
    ),
};

export const Error: Story = {
    args: {
        error: true,
        errorText: "Error message",
    },
};
