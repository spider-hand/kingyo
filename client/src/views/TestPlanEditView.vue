<template>
  <form v-if="!isFetchingTestPlan" class="flex flex-col items-center justify-center max-w-5xl w-full gap-8 p-8"
    @submit="onSubmit">
    <div class="flex flex-row items-center justify-between w-full">
      <TitleComponent title="Edit Test Plan" />
    </div>
    <FormField v-slot="{ componentField }" name="title" class="flex flex-col w-full">
      <FormItem class="w-full gap-1">
        <FormLabel class="text-xs text-muted-foreground">Title</FormLabel>
        <FormControl class="w-full">
          <Input class="w-full" type="text" placeholder="Title" max="100" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <FormField v-slot="{ componentField }" name="status" class="flex flex-col w-full align-start">
      <FormItem class="w-full">
        <SelectWrapperComponent label="Status">
          <Select v-bind="componentField">
            <SelectTrigger class="w-[180px]">
              <SelectValue placeholder="Status"></SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem v-for="option in TEST_PLAN_STATUS_OPTIONS" :key="option.value" :value="option.value">
                  {{ option.label }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </SelectWrapperComponent>
      </FormItem>
    </FormField>
    <div class="flex flex-row items-center justify-end w-full gap-4">
      <Button type="submit">
        Update
      </Button>
      <Button variant="outline" @click="$router.push({ name: 'test-plan-list' })">
        Cancel
      </Button>
    </div>
  </form>
</template>

<script setup lang="ts">
import SelectWrapperComponent from '@/components/SelectWrapperComponent.vue';
import TitleComponent from '@/components/TitleComponent.vue';
import Button from '@/components/ui/button/Button.vue';
import { FormField } from '@/components/ui/form';
import FormControl from '@/components/ui/form/FormControl.vue';
import FormItem from '@/components/ui/form/FormItem.vue';
import FormLabel from '@/components/ui/form/FormLabel.vue';
import FormMessage from '@/components/ui/form/FormMessage.vue';
import Input from '@/components/ui/input/Input.vue';
import Select from '@/components/ui/select/Select.vue';
import SelectContent from '@/components/ui/select/SelectContent.vue';
import SelectGroup from '@/components/ui/select/SelectGroup.vue';
import SelectItem from '@/components/ui/select/SelectItem.vue';
import SelectTrigger from '@/components/ui/select/SelectTrigger.vue';
import SelectValue from '@/components/ui/select/SelectValue.vue';
import useTestPlanQuery from '@/composables/useTestPlanQuery';
import { TEST_PLAN_STATUS_OPTIONS } from '@/consts';
import { ListTestplansStatusEnum } from '@/services';
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { z } from 'zod';

const router = useRouter();

const { id } = useRoute().params;
const { testPlan, isFetchingTestPlan, mutateOnUpdateTestPlan } = useTestPlanQuery(Number(id));

const formSchema = toTypedSchema(z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be at most 100 characters long'),
  status: z.enum(['not_started', 'in_progress', 'completed'], {
    message: 'Status is required',
  }),
}));

const { handleSubmit, resetForm } = useForm({
  validationSchema: formSchema,
  initialValues: {
    title: testPlan.value?.title || '',
  },
});

const onSubmit = handleSubmit(async (values) => {
  const { title, status } = values;
  await updateTestPlan(title, status);
});

const updateTestPlan = async (title: string, status: ListTestplansStatusEnum) => {
  try {
    await mutateOnUpdateTestPlan({
      id: Number(id),
      title: title,
      status: status,
    });
    router.push({ name: 'test-plan-list' });
  } catch (error) {
    console.error('Failed to update test plan:', error);
  }
};

watch(testPlan, (newTestPlan) => {
  if (newTestPlan) {
    // Update form values when test plan has been fetched
    resetForm({
      values: {
        title: newTestPlan.title,
        status: newTestPlan.status!,
      }
    })
  }
});
</script>
