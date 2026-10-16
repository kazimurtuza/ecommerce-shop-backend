import { Controller, Get, Inject, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('order')
export class AppController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy
  ) { }

  @Get(':id')
  async createOrder(@Param('id') id: string) {
    const pattern = { cmd: "validateUser" };
    const payload = { user_id: Number(id) }
    const authResponse = await firstValueFrom(this.authClient.send(pattern, payload))
    if (authResponse.is_valid) {
      return {
        data: "Order created successfully",
        user: authResponse.data
      }
    }
    return {
      data: "Order not created",
      user: null
    }

  }

}
