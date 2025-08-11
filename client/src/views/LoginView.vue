<template>
  <form class="flex items-center justify-center h-screen w-full bg-primary-foreground" @submit="onSubmit">
    <Card class="w-[400px] flex flex-col items-center justify-center gap-8 px-8">
      <CardHeader class="flex flex-col items-center justify-center gap-6 w-full px-0">
        <LogoComponent :height="'40'" />
        <CardTitle class="text-2xl font-normal">Sign in</CardTitle>
      </CardHeader>
      <CardContent class="flex flex-col items-center justify-center gap-4 w-full px-0">
        <FormField v-slot="{ componentField }" name="username" class="w-full">
          <FormItem class="w-full">
            <FormControl class="w-full">
              <Input class="w-full" type="text" placeholder="Username" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="password" class="w-full">
          <FormItem class="w-full">
            <FormControl class="w-full">
              <Input class="w-full" type="password" placeholder="Password" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <Button class="w-full" type="submit" :disabled="isSigningIn">
          <LoaderCircle v-if="isSigningIn" class="mr-1 animate-spin" />
          Sign in
        </Button>
        <span class="text-sm text-destructive text-center" v-if="errorMessage">{{ errorMessage }}</span>
      </CardContent>
      <CardFooter class="flex flex-col items-center justify-center gap-4 w-full px-0">
        <span class="text-sm text-muted-foreground text-center">Forgot your password? Please reach out to the
          administrator
          for assistance.</span>
      </CardFooter>
    </Card>
  </form>
</template>

<script setup lang="ts">
import LogoComponent from '@/components/LogoComponent.vue';
import Button from '@/components/ui/button/Button.vue';
import Card from '@/components/ui/card/Card.vue';
import CardContent from '@/components/ui/card/CardContent.vue';
import CardFooter from '@/components/ui/card/CardFooter.vue';
import CardHeader from '@/components/ui/card/CardHeader.vue';
import CardTitle from '@/components/ui/card/CardTitle.vue';
import { FormField } from '@/components/ui/form';
import FormControl from '@/components/ui/form/FormControl.vue';
import FormItem from '@/components/ui/form/FormItem.vue';
import FormMessage from '@/components/ui/form/FormMessage.vue';
import Input from '@/components/ui/input/Input.vue';
import useTokenApi from '@/composables/useTokenApi';
import { toTypedSchema } from '@vee-validate/zod';
import { LoaderCircle } from 'lucide-vue-next';
import { useForm } from 'vee-validate';
import { useRouter } from 'vue-router';
import { z } from 'zod';

const router = useRouter()

const { signIn, isSigningIn, errorMessage } = useTokenApi()

const formSchema = toTypedSchema(z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
}));

const { handleSubmit } = useForm({
  validationSchema: formSchema,
});

const onSubmit = handleSubmit(async (values) => {
  try {
    const { username, password } = values;
    await signIn(username, password);
    router.push({ name: 'test-plan-list' });
  } catch (error) {
    console.error('Error signing in:', error);
  }
});
</script>
