<template>
  <div class="flex items-center justify-center h-screen w-full bg-primary-foreground">
    <Card class="w-[400px] flex flex-col items-center justify-center gap-8 px-8">
      <CardHeader class="flex flex-col items-center justify-center gap-6 w-full px-0">
        <LogoComponent :height="'40'" />
        <CardTitle class="text-2xl font-normal">Sign in</CardTitle>
      </CardHeader>
      <CardContent class="flex flex-col items-center justify-center gap-4 w-full px-0">
        <Input class="w-full" placeholder="Username or Email" />
        <Input class="w-full" type="password" placeholder="Password" />
        <Button class="w-full" @click="$router.push({ name: 'test-plan-list' })">Sign in</Button>
      </CardContent>
      <CardFooter class="flex flex-col items-center justify-center gap-4 w-full px-0">
        <span class="text-sm text-muted-foreground text-center">Forgot your password? Please reach out to the administrator
          for assistance.</span>
      </CardFooter>
    </Card>
  </div>
</template>

<script setup lang="ts">
import LogoComponent from '@/components/LogoComponent.vue';
import Button from '@/components/ui/button/Button.vue';
import Card from '@/components/ui/card/Card.vue';
import CardContent from '@/components/ui/card/CardContent.vue';
import CardFooter from '@/components/ui/card/CardFooter.vue';
import CardHeader from '@/components/ui/card/CardHeader.vue';
import CardTitle from '@/components/ui/card/CardTitle.vue';
import Input from '@/components/ui/input/Input.vue';

</script>
