import { NgClass } from "@angular/common";
import { Component, input } from "@angular/core";
import { ChatMessage } from "../../websocket.service";

@Component({
  selector: 'app-message',
  template: `
    <div class="flex items-start gap-4 w-full"
      [class.flex-row-reverse]="myMessage()">
      <div class="rounded-full font-semibold text-xl w-10 h-10 flex justify-center items-center"
        [ngClass]="myMessage() ? 'bg-blue-100': 'bg-gray-200'">
        {{ message().user.charAt(0).toUpperCase() }}
      </div>
      <div
        class="inline-block max-w-[40%] rounded-md px-4 py-2 break-all"
        [ngClass]="myMessage() ? 'bg-blue-100': 'bg-gray-200'">
        @if (!myMessage()) {
          <p class="text-xs text-blue-600 mb-1">
            {{ message().user }}
          </p>
        }
        <p>{{ message().content }}</p>
      </div>
    </div>
  `,
  imports: [NgClass],
})
export class MessageComponent {
  myMessage = input<boolean>(false);

  message = input.required<ChatMessage>();
}
