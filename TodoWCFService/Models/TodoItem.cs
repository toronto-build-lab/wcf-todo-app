using System.Runtime.Serialization;

namespace Todo.TodoWCFService.Models
{
    [DataContract(Namespace = "http://schemas.datacontract.org/2004/07/TodoWCFService.Models")]
    public class TodoItem
    {
        [DataMember]
        public string ID { get; set; }

        [DataMember]
        public string Name { get; set; }

        [DataMember]
        public string Notes { get; set; }

        [DataMember]
        public bool Done { get; set; }
    }
}
