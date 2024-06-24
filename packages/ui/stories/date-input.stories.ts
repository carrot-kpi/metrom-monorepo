import type { Meta, StoryObj } from "@storybook/vue3";
import MetDateInput from "../src/components/date-input/MetDateInput.vue";
import { onMounted, onUnmounted, ref } from "vue";
import dayjs, { Dayjs } from "dayjs";

const meta: Meta<typeof MetDateInput> = {
    component: MetDateInput,
    title: "Input/DatePicker",
};

export default meta;

type Story = StoryObj<typeof MetDateInput>;

export const DatePicker: Story = {
    render: () => ({
        setup() {
            const date = ref<Dayjs | undefined>();
            const minDate = ref<Dayjs | undefined>();

            const handleValueOnChange = (value: Dayjs) => {
                date.value = value;
            };

            let interval: NodeJS.Timeout;
            onMounted(() => {
                interval = setInterval(() => {
                    minDate.value = dayjs();
                }, 1000);
            });
            onUnmounted(() => {
                clearInterval(interval);
            });

            return { args: { date, minDate, handleValueOnChange } };
        },
        components: {
            MetDateInput,
        },
        template: `
            <div class="flex flex-col gap-4">
                <MetDateInput
                    label="Date input"
                    placeholder="Date input"
                    :onDatePick="args.handleValueOnChange"
                    :value="args.date.value"
                />
                <MetDateInput
                    label="Date time input"
                    placeholder="Date time input"
                    time
                    :onDatePick="args.handleValueOnChange"
                    :value="args.date.value"
                />
                <MetDateInput
                    label="Date input with min valye"
                    placeholder="Date input"
                    time
                    :min="args.minDate.value"
                    :onDatePick="args.handleValueOnChange"
                    :value="args.date.value"
                />
            </div>
        `,
    }),
};
