<template>
  <form class="flex flex-col items-center justify-center max-w-5xl w-full gap-8 p-8" @submit="onSubmit">
    <div class="flex flex-row items-center justify-between w-full">
      <TitleComponent title="Add Test Plan" />
    </div>
    <FormField v-slot="{ componentField }" name="title" class="flex flex-col w-full">
      <FormItem class="w-full gap-1">
        <FormLabel class="text-xs text-muted-foreground">Title</FormLabel>
        <FormControl class="w-full">
          <Input class="w-full" type="text" placeholder="Test Plan Title" default-value="New Test Plan" max="100" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <div class="flex flex-row items-center justify-end w-full gap-4">
      <Button type="submit">
        Create
      </Button>
      <Button variant="outline" @click="$router.push({ name: 'test-plan-list' })">
        Cancel
      </Button>
    </div>
  </form>
</template>

<script setup lang="ts">
import TitleComponent from '@/components/TitleComponent.vue';
import Button from '@/components/ui/button/Button.vue';
import { FormField } from '@/components/ui/form';
import FormControl from '@/components/ui/form/FormControl.vue';
import FormItem from '@/components/ui/form/FormItem.vue';
import FormLabel from '@/components/ui/form/FormLabel.vue';
import FormMessage from '@/components/ui/form/FormMessage.vue';
import Input from '@/components/ui/input/Input.vue';
import useTestPlanQuery from '@/composables/useTestPlanQuery';
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { useRouter } from 'vue-router';
import { z } from 'zod';

const router = useRouter();

const { mutateOnCreateTestPlan } = useTestPlanQuery();

const formSchema = toTypedSchema(z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be at most 100 characters long'),
}));

const { handleSubmit } = useForm({
  validationSchema: formSchema,
});

const onSubmit = handleSubmit(async (values) => {
  const { title } = values;
  await createTestPlan(title);
});

const createTestPlan = async (title: string) => {
  try {
    await mutateOnCreateTestPlan({ title: title });

    router.push({ name: 'test-plan-list' });
  } catch (error) {
    console.error('Error creating test plan:', error);
  }
}
</script>
