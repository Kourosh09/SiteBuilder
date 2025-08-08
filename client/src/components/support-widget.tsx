import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Phone, Mail, Clock, CheckCircle, AlertCircle, HelpCircle, Send, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface SupportMessage {
  id: string;
  name: string;
  email: string;
  type: string;
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'new' | 'in_progress' | 'resolved';
  createdAt: Date;
}

interface ChatMessage {
  id: string;
  message: string;
  sender: 'user' | 'support';
  timestamp: Date;
}

export function SupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      message: 'Hi! I\'m here to help with BuildwiseAI. How can I assist you today?',
      sender: 'support',
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [messageForm, setMessageForm] = useState({
    name: '',
    email: '',
    type: '',
    subject: '',
    message: '',
    priority: 'medium' as const
  });

  const { toast } = useToast();

  const submitMessageMutation = useMutation({
    mutationFn: async (data: Omit<SupportMessage, 'id' | 'status' | 'createdAt'>) => {
      return apiRequest('/api/support/messages', 'POST', data);
    },
    onSuccess: () => {
      toast({
        title: "Message Sent",
        description: "We'll get back to you within 24 hours!",
      });
      setMessageForm({
        name: '',
        email: '',
        type: '',
        subject: '',
        message: '',
        priority: 'medium'
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  });

  const sendChatMessage = () => {
    if (!newMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      message: newMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setNewMessage('');

    // Simulate support response
    setTimeout(() => {
      const supportResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: getAutoResponse(newMessage),
        sender: 'support',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, supportResponse]);
    }, 1500);
  };

  const getAutoResponse = (message: string): string => {
    const msgLower = message.toLowerCase();
    
    if (msgLower.includes('api') || msgLower.includes('integration')) {
      return 'For API integration issues, please check our API Contact Guide. BC Assessment: 1-800-663-7867, REBGV: 604-730-3000. Need more help?';
    } else if (msgLower.includes('login') || msgLower.includes('access')) {
      return 'For login issues, try using the email/SMS verification (code: 123456 for demo). Need password reset help?';
    } else if (msgLower.includes('data') || msgLower.includes('property')) {
      return 'Property data is currently using enhanced market intelligence. Real API integration requires commercial access - see our contact guide for details.';
    } else if (msgLower.includes('price') || msgLower.includes('cost')) {
      return 'BuildwiseAI offers flexible pricing. Would you like to schedule a demo or discuss enterprise options?';
    } else {
      return 'Thanks for reaching out! I\'ll connect you with our team for personalized assistance. What specific area do you need help with?';
    }
  };

  const handleSubmitMessage = (e: React.FormEvent) => {
    e.preventDefault();
    submitMessageMutation.mutate(messageForm);
  };

  return (
    <>
      {/* Floating Support Button - Bottom Right */}
      <div className="fixed bottom-6 right-6 z-[9999]">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="rounded-full h-16 w-16 shadow-xl hover:shadow-2xl transition-all duration-300 bg-blue-600 hover:bg-blue-700 border-2 border-white animate-pulse"
              data-testid="button-support-widget"
              title="Need Help? Click for Support"
            >
              {isOpen ? <X className="h-7 w-7 text-white" /> : <MessageCircle className="h-7 w-7 text-white" />}
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-[500px] max-h-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-blue-600" />
                BuildwiseAI Support
              </DialogTitle>
              <DialogDescription>
                Get help with your real estate development platform
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="chat" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="chat" data-testid="tab-chat">Live Chat</TabsTrigger>
                <TabsTrigger value="message" data-testid="tab-message">Send Message</TabsTrigger>
                <TabsTrigger value="contact" data-testid="tab-contact">Contact Info</TabsTrigger>
              </TabsList>

              {/* Live Chat Tab */}
              <TabsContent value="chat" className="space-y-4">
                <div className="h-80 overflow-y-auto space-y-3 p-3 bg-gray-50 rounded-lg">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          msg.sender === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border shadow-sm'
                        }`}
                        data-testid={`message-${msg.sender}-${msg.id}`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <p className={`text-xs mt-1 ${
                          msg.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {msg.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                    data-testid="input-chat-message"
                  />
                  <Button onClick={sendChatMessage} size="sm" data-testid="button-send-chat">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>

              {/* Send Message Tab */}
              <TabsContent value="message" className="space-y-4">
                <form onSubmit={handleSubmitMessage} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={messageForm.name}
                        onChange={(e) => setMessageForm(prev => ({ ...prev, name: e.target.value }))}
                        required
                        data-testid="input-message-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={messageForm.email}
                        onChange={(e) => setMessageForm(prev => ({ ...prev, email: e.target.value }))}
                        required
                        data-testid="input-message-email"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Issue Type</Label>
                      <Select
                        value={messageForm.type}
                        onValueChange={(value) => setMessageForm(prev => ({ ...prev, type: value }))}
                        required
                      >
                        <SelectTrigger data-testid="select-message-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technical">Technical Support</SelectItem>
                          <SelectItem value="api">API Integration</SelectItem>
                          <SelectItem value="billing">Billing Question</SelectItem>
                          <SelectItem value="feature">Feature Request</SelectItem>
                          <SelectItem value="general">General Inquiry</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={messageForm.priority}
                        onValueChange={(value) => setMessageForm(prev => ({ ...prev, priority: value as any }))}
                      >
                        <SelectTrigger data-testid="select-message-priority">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={messageForm.subject}
                      onChange={(e) => setMessageForm(prev => ({ ...prev, subject: e.target.value }))}
                      required
                      data-testid="input-message-subject"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={messageForm.message}
                      onChange={(e) => setMessageForm(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Describe your issue or question in detail..."
                      rows={4}
                      required
                      data-testid="textarea-message-content"
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={submitMessageMutation.isPending}
                    data-testid="button-submit-message"
                  >
                    {submitMessageMutation.isPending ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </TabsContent>

              {/* Contact Info Tab */}
              <TabsContent value="contact" className="space-y-4">
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Clock className="h-5 w-5 text-green-600" />
                        Support Hours
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span>Monday - Friday:</span>
                        <span className="font-medium">9:00 AM - 6:00 PM PST</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Saturday:</span>
                        <span className="font-medium">10:00 AM - 4:00 PM PST</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sunday:</span>
                        <span className="text-gray-500">Closed</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Contact Methods</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">Email Support</p>
                          <p className="text-sm text-gray-600">support@buildwiseai.ca</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium">Phone Support</p>
                          <p className="text-sm text-gray-600">1-800-BUILD-AI (1-800-284-5324)</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <MessageCircle className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="font-medium">Live Chat</p>
                          <p className="text-sm text-gray-600">Available during support hours</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Response Times</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Badge variant="destructive" className="w-2 h-2 p-0 rounded-full"></Badge>
                          Urgent
                        </span>
                        <span className="text-sm font-medium">Within 2 hours</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Badge variant="secondary" className="w-2 h-2 p-0 rounded-full bg-orange-500"></Badge>
                          High
                        </span>
                        <span className="text-sm font-medium">Within 4 hours</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Badge variant="secondary" className="w-2 h-2 p-0 rounded-full bg-blue-500"></Badge>
                          Medium
                        </span>
                        <span className="text-sm font-medium">Within 24 hours</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Badge variant="outline" className="w-2 h-2 p-0 rounded-full"></Badge>
                          Low
                        </span>
                        <span className="text-sm font-medium">Within 48 hours</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}